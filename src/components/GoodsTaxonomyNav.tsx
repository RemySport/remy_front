"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import TogglePill from "@/components/TogglePill";
import { getGoodsFacets, type GoodsFacetsResponse, type GoodsFilter } from "@/lib/api/goods";
import { ApiError } from "@/lib/api/client";

export type GoodsTab = "brand" | "club";
export type GoodsAxis = "brand" | "club" | "category";

/** 탭별 드릴다운 순서: 브랜드 → 구단 → 상품종류 / 구단 → 브랜드 → 상품종류 */
export const AXIS_ORDER: Record<GoodsTab, GoodsAxis[]> = {
  brand: ["brand", "club", "category"],
  club: ["club", "brand", "category"],
};

const AXIS_LABEL: Record<GoodsAxis, string> = {
  brand: "브랜드",
  club: "구단",
  category: "상품종류",
};

type Chip = { id: number; label: string; count: number };

function chipsOf(axis: GoodsAxis, facets: GoodsFacetsResponse): Chip[] {
  if (axis === "brand") return facets.brands.map((f) => ({ id: f.brandId, label: f.name, count: f.count }));
  if (axis === "club") return facets.clubs.map((f) => ({ id: f.clubId, label: f.name, count: f.count }));
  return facets.categories.map((f) => ({ id: f.categoryId, label: f.name, count: f.count }));
}

/** 이 단계의 선택지는 위 단계에서 고른 값만 적용해 센다(아래 단계 선택은 무시). */
function ancestorFilter(order: GoodsAxis[], level: number, filter: GoodsFilter): GoodsFilter {
  const result: GoodsFilter = {};
  for (const axis of order.slice(0, level)) result[axis] = filter[axis] ?? null;
  return result;
}

function filterKey(filter: GoodsFilter) {
  return `${filter.brand ?? ""}|${filter.club ?? ""}|${filter.category ?? ""}`;
}

export default function GoodsTaxonomyNav({
  tab,
  filter,
  onTabChange,
  onSelect,
}: {
  tab: GoodsTab;
  filter: GoodsFilter;
  onTabChange: (tab: GoodsTab) => void;
  onSelect: (axis: GoodsAxis, id: number | null) => void;
}) {
  const order = AXIS_ORDER[tab];
  // 위 단계가 선택돼야 다음 단계를 보여준다.
  const visibleLevels = order.filter((_, i) => i === 0 || filter[order[i - 1]] != null).length;
  const queries = order.slice(0, visibleLevels).map((_, i) => ancestorFilter(order, i, filter));
  const queryKey = queries.map(filterKey).join("/");

  const [facets, setFacets] = useState<Record<string, GoodsFacetsResponse>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const missing = queries.filter((q) => !(filterKey(q) in facets));
    if (missing.length === 0) return;
    Promise.all(missing.map((q) => getGoodsFacets(q).then((res) => [filterKey(q), res] as const)))
      .then((entries) => {
        if (cancelled) return;
        setFacets((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : "분류를 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
    // queries 는 queryKey 로 대표된다. facets 는 캐시 확인용이라 의존성에서 뺀다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  return (
    <div className="px-4 pt-6">
      <TogglePill
        options={["브랜드", "구단"]}
        value={tab === "brand" ? 0 : 1}
        onChange={(v) => onTabChange(v === 0 ? "brand" : "club")}
      />

      {error && <p className="mt-4 text-center text-xs text-soft">{error}</p>}

      {order.slice(0, visibleLevels).map((axis, level) => {
        const res = facets[filterKey(queries[level])];
        const chips = res ? chipsOf(axis, res) : null;
        const selected = filter[axis] ?? null;
        return (
          <div key={axis} className="mt-4">
            <p className="text-xs font-bold">{AXIS_LABEL[axis]}</p>
            <ChipRow>
              {chips === null ? (
                <span className="py-1 text-xs text-soft">불러오는 중...</span>
              ) : (
                <>
                  <ChipButton label="전체" selected={selected === null} onClick={() => onSelect(axis, null)} />
                  {chips.map((chip) => (
                    <ChipButton
                      key={chip.id}
                      label={chip.label}
                      count={chip.count}
                      selected={selected === chip.id}
                      onClick={() => onSelect(axis, chip.id)}
                    />
                  ))}
                </>
              )}
            </ChipRow>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 가로 칩 목록. 터치 기기는 기본 스와이프로 스크롤되지만 PC 마우스는 가로 스크롤 수단이 없어서
 * 세로 휠을 가로 이동으로 바꾸고, 마우스 드래그로도 넘길 수 있게 한다.
 */
function ChipRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scrollLeft: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // React onWheel 은 passive 라 preventDefault 가 안 먹으므로 직접 등록한다.
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      // 끝에 닿았으면 페이지 세로 스크롤로 넘긴다.
      if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={ref}
      className="-mx-4 mt-2 flex select-none gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onPointerDown={(e) => {
        suppressClick.current = false;
        if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
        drag.current = { x: e.clientX, scrollLeft: ref.current.scrollLeft, moved: false };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || !ref.current) return;
        const dx = e.clientX - d.x;
        if (!d.moved && Math.abs(dx) > 5) {
          d.moved = true;
          ref.current.setPointerCapture(e.pointerId);
        }
        if (d.moved) ref.current.scrollLeft = d.scrollLeft - dx;
      }}
      onPointerUp={() => {
        // 드래그로 끝난 경우 칩이 눌리지 않도록 이어지는 click 을 한 번 막는다.
        suppressClick.current = drag.current?.moved ?? false;
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          suppressClick.current = false;
          e.stopPropagation();
          e.preventDefault();
        }
      }}
    >
      {children}
    </div>
  );
}

function ChipButton({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count?: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`shrink-0 whitespace-nowrap rounded border px-3 py-1 text-xs font-bold ${
        selected ? "border-primary bg-primary text-white" : "border-line bg-white text-black"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1 font-normal ${selected ? "text-white/80" : "text-soft"}`}>{count}</span>
      )}
    </button>
  );
}
