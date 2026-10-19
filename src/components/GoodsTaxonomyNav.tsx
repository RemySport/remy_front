"use client";

import { useEffect, useState } from "react";
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
            <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
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
            </div>
          </div>
        );
      })}
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
