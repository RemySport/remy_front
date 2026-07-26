"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import TopBarMain from "@/components/TopBarMain";
import BottomNav from "@/components/BottomNav";
import TogglePill from "@/components/TogglePill";
import MatchCard from "@/components/MatchCard";
import ImageWithFallback from "@/components/ImageWithFallback";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { getTickets, type TicketSummary } from "@/lib/api/tickets";
import { getMyTeam, type MyTeamResponse } from "@/lib/api/user";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { readListSnapshot, saveListSnapshot } from "@/lib/listSnapshot";

/** 백엔드 페이지 번호는 1부터 시작한다 (page=0 은 COMMON4000 "잘못된 요청 파라미터"). */
const FIRST_PAGE = 1;
const PAGE_SIZE = 20;
/** 스냅샷에 담을 최대 항목 수. PAGE_SIZE 의 배수여야 저장한 페이지 번호와 어긋나지 않는다. */
const SNAPSHOT_MAX = 20 * PAGE_SIZE;
const SNAPSHOT_KEY = "tickets:list";
/**
 * 탭(클럽리그/토너먼트) 필터가 클라이언트에서 걸리기 때문에, 한 페이지를 더 불러와도
 * 현재 탭에는 아무것도 추가되지 않을 수 있다. 그 상태로 관찰자가 계속 화면에 남아 있으면
 * 남은 전 페이지를 연속 요청하게 되므로, 헛방이 이만큼 이어지면 멈추고 수동 버튼을 띄운다.
 */
const MAX_BARREN_LOADS = 3;

type Snapshot = {
  tab: 0 | 1;
  tickets: TicketSummary[];
  loadedPage: number;
  totalPages: number | null;
};

const matchesTab = (ticket: TicketSummary, tab: 0 | 1) =>
  tab === 0 ? ticket.competitionType !== "TOURNAMENT" : ticket.competitionType === "TOURNAMENT";

/** 마이팀이 설정되어 있으면 마이팀이 홈/원정으로 출전하는 경기만, 아니면 전체를 통과시킨다. */
const matchesMyTeam = (ticket: TicketSummary, myTeamId: number | null) =>
  !myTeamId || ticket.home?.teamId === myTeamId || ticket.away?.teamId === myTeamId;

export default function TicketsPage() {
  const { status } = useAuth();

  /*
   * 정적 배포(output: "export")라 이 페이지는 sessionStorage 없이 빌드된 정적 HTML로 먼저
   * 그려진다. 스냅샷 값으로 초기 state 를 바로 채우면 그 정적 HTML과 클라이언트 첫 렌더가
   * 달라져 하이드레이션 에러가 나므로, 초기값은 항상 "빈 목록"으로 맞추고 마운트 후
   * useEffect 에서 복원한다.
   */
  const [snapshot] = useState(() => readListSnapshot<Snapshot>(SNAPSHOT_KEY));

  const [tab, setTab] = useState<0 | 1>(0);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loadedPage, setLoadedPage] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myTeam, setMyTeam] = useState<MyTeamResponse>(null);
  const [atListEnd, setAtListEnd] = useState(false);
  const [paused, setPaused] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const seenIdsRef = useRef(new Set((snapshot?.data.tickets ?? []).map((t) => t.ticketId)));
  const barrenLoadsRef = useRef(0);
  /*
   * 다른 화면으로 이동할 때 Next.js 가 새 페이지를 위해 스크롤을 이미 0으로 되돌려놓은
   * 뒤에야 이 페이지의 언마운트 정리 코드가 실행된다. 그 시점의 window.scrollY 를 읽으면
   * 이미 0이라 저장이 무의미해지므로, 실제 스크롤 이벤트로만 갱신되는 ref 에 최신 위치를
   * 계속 담아두고 그 값을 저장한다.
   */
  const scrollYRef = useRef(0);

  const hasMore = totalPages === null || loadedPage < totalPages;
  const myTeamId = status === "authenticated" ? myTeam?.teamId ?? null : null;

  /* ── 목록 로딩 ─────────────────────────────────────────── */

  const loadPage = useCallback(async (page: number, activeTab: 0 | 1, activeTeamId: number | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTickets({ page, size: PAGE_SIZE });
      const fresh = res.tickets.filter((t) => !seenIdsRef.current.has(t.ticketId));
      for (const t of fresh) seenIdsRef.current.add(t.ticketId);

      // 이번 페이지가 현재 탭/마이팀 리그 필터에 실제로 보탬이 됐는지로 헛방 여부를 판단한다.
      barrenLoadsRef.current = fresh.some((t) => matchesTab(t, activeTab) && matchesMyTeam(t, activeTeamId))
        ? 0
        : barrenLoadsRef.current + 1;

      setTotalPages(res.totalPages);
      setTickets((prev) => [...prev, ...fresh]);
      setLoadedPage(page);
      if (barrenLoadsRef.current >= MAX_BARREN_LOADS) setPaused(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "티켓 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 첫 진입. 스냅샷이 있으면 복원하고, 없으면 1페이지를 새로 받는다.
  useEffect(() => {
    void Promise.resolve().then(() => {
      if (snapshot) {
        setTab(snapshot.data.tab);
        setTickets(snapshot.data.tickets);
        setLoadedPage(snapshot.data.loadedPage);
        setTotalPages(snapshot.data.totalPages);
        return;
      }
      return loadPage(FIRST_PAGE, tab, myTeamId);
    });
    // 마운트 시 한 번만. tab/myTeamId 의 최신값이 필요한 시점이 아니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setAtListEnd(entries[0].isIntersecting), {
      rootMargin: "240px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // IntersectionObserver 는 "교차 상태가 변할 때"만 콜백한다. 한 페이지를 붙인 뒤에도 관찰자가
  // 여전히 화면 안이면 콜백이 다시 오지 않으므로, loadedPage 변화에 맞춰 여기서 이어서 불러온다.
  useEffect(() => {
    if (!atListEnd || loading || error || paused || !hasMore || loadedPage === 0) return;
    void Promise.resolve().then(() => loadPage(loadedPage + 1, tab, myTeamId));
  }, [atListEnd, loading, error, paused, hasMore, loadedPage, tab, myTeamId, loadPage]);

  const handleTabChange = (next: 0 | 1) => {
    barrenLoadsRef.current = 0;
    setPaused(false);
    setTab(next);
  };

  const resumeLoading = () => {
    barrenLoadsRef.current = 0;
    setPaused(false);
  };

  /* ── 마이팀 ────────────────────────────────────────────── */

  useEffect(() => {
    Promise.resolve()
      .then(() => (status === "authenticated" ? getMyTeam() : null))
      .then(setMyTeam)
      .catch(() => setMyTeam(null));
  }, [status]);

  /* ── 탭/마이팀 필터 ───────────────────────────────────────── */

  const matches = useMemo(
    () => tickets.filter((t) => matchesTab(t, tab) && matchesMyTeam(t, myTeamId)),
    [tickets, tab, myTeamId]
  );

  const availableCount = matches.filter((m) => m.status === "AVAILABLE").length;
  const closedCount = matches.length - availableCount;

  /* ── 뒤로가기 복원 ─────────────────────────────────────── */

  // 실제 스크롤 이벤트가 들어올 때만 최신 위치를 기록한다 (페이지 이동으로 인한
  // 스크롤 리셋은 window.scrollY 는 즉시 바꾸지만 scroll 이벤트는 비동기라, 이 ref 는
  // 언마운트 시점까지 사용자가 마지막으로 실제 보고 있던 위치를 유지한다).
  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 데이터가 바뀔 때마다, 그리고 화면을 떠날 때(cleanup) 현재 스크롤 위치까지 함께 저장한다.
  useEffect(() => {
    if (loadedPage === 0) return;
    const save = () => {
      const capped = tickets.length > SNAPSHOT_MAX;
      saveListSnapshot<Snapshot>(
        SNAPSHOT_KEY,
        capped
          ? {
              tab,
              tickets: tickets.slice(0, SNAPSHOT_MAX),
              loadedPage: SNAPSHOT_MAX / PAGE_SIZE,
              totalPages,
            }
          : { tab, tickets, loadedPage, totalPages },
        scrollYRef.current
      );
    };
    save();
    window.addEventListener("pagehide", save);
    /*
     * 링크를 눌러 다른 화면으로 이동하는 경우, Next.js 가 라우트 전환 중 스크롤을
     * 0으로 되돌리는 시점이 이 컴포넌트의 언마운트 정리보다 빨라서 cleanup 에서는
     * 이미 리셋된 값만 보게 된다. 클릭이 실제 이동 처리로 이어지기 전, 캡처 단계에서
     * 먼저 스크롤 위치를 저장해둔다.
     */
    document.addEventListener("click", save, { capture: true });
    return () => {
      // 언마운트 시점엔 이미 위 클릭 캡처(또는 pagehide)로 저장이 끝난 뒤이며, 여기서
      // 다시 save() 를 부르면 Next.js 가 리셋해놓은 scrollY(0)로 덮어써버리므로 호출하지 않는다.
      window.removeEventListener("pagehide", save);
      document.removeEventListener("click", save, { capture: true });
    };
  }, [tab, tickets, loadedPage, totalPages]);

  const pendingScrollRef = useRef(snapshot?.scrollY ?? 0);
  useLayoutEffect(() => {
    const y = pendingScrollRef.current;
    // 스냅샷 복원은 마운트 후 별도 이펙트에서 비동기로 이뤄지므로, 카드들이 실제로
    // 목록에 반영되기 전(tickets 가 아직 빈 배열)에는 스크롤을 옮기지 않는다.
    if (!y || tickets.length === 0) return;
    pendingScrollRef.current = 0;
    // 복원한 카드들이 실제로 배치된 뒤에 옮겨야 하므로 첫 페인트 직후로 미룬다.
    const id = requestAnimationFrame(() => window.scrollTo(0, y));
    return () => cancelAnimationFrame(id);
  }, [tickets]);

  /* ── 렌더 ──────────────────────────────────────────────── */

  return (
    <div className="pb-[130px]">
      <TopBarMain />

      <div className="relative">
        {/* 마이팀 고정 영역: 목록이 스크롤되는 동안 상단바 바로 아래에 붙어 있는다. */}
        <div className="sticky top-16 z-30 bg-white px-4 pb-5 pt-6 shadow-[0_6px_12px_-8px_rgba(0,0,0,0.25)]">
          {/* 워터마크 (좌측으로 삐져나오는 부분만 잘라낸다) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/watermark-ball.svg"
              alt=""
              aria-hidden
              className="absolute left-[-13px] top-[60px] h-[201px] w-[215px]"
            />
          </div>

          <div className="relative">
            <TogglePill options={["클럽리그", "토너먼트"]} value={tab} onChange={handleTabChange} />

            {/* 마이팀 */}
            <div className="mt-8 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-[6px]">
                  <span className="h-[10px] w-[3px] shrink-0 bg-primary" />
                  <span className="text-[10px] font-extrabold leading-[11px]">마이팀</span>
                </div>
                <h2 className="mt-[10px] break-words text-lg font-extrabold leading-[23px]">
                  {status === "authenticated"
                    ? myTeam
                      ? myTeam.teamName
                      : "미선택"
                    : "로그인이 필요해요"}
                </h2>
              </div>
              <div className="relative shrink-0">
                <ImageWithFallback
                  src={myTeam?.logoUrl}
                  alt={myTeam?.teamName ?? ""}
                  className="h-[60px] w-[60px] object-contain"
                />
                <Link
                  href={status === "authenticated" ? "/myteam" : "/login"}
                  className="absolute -bottom-1 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[8px] font-black text-white"
                >
                  변경
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 경기 목록: 요약 박스도 이 안에 포함시켜 목록과 함께 스크롤되게 한다. */}
        <div className="px-4 pt-8">
          {/* 요약 박스 */}
          <div className="mb-5 rounded-md border border-black bg-white">
            <div className="flex h-[50px] items-center justify-between gap-2 px-4">
              <span className="truncate text-xs text-soft">
                {tab === 0 ? "클럽리그" : "토너먼트"} 경기
              </span>
              <span className="shrink-0 whitespace-nowrap text-xs font-extrabold">
                {matches.length} 경기
              </span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-black border-t border-black">
              <div className="flex h-[50px] items-center justify-between gap-2 px-4">
                <span className="truncate text-xs text-soft">예약가능</span>
                <span className="shrink-0 whitespace-nowrap text-xs font-extrabold">
                  {availableCount} 경기
                </span>
              </div>
              <div className="flex h-[50px] items-center justify-between gap-2 px-4">
                <span className="truncate text-xs text-soft">예약불가</span>
                <span className="shrink-0 whitespace-nowrap text-xs font-extrabold">
                  {closedCount} 경기
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {matches.map((m) => (
              <MatchCard key={m.ticketId} ticket={m} />
            ))}
          </div>

          <div ref={sentinelRef} className="h-px" />

          <div className="pt-6">
            {error && <p className="text-center text-xs text-soft">{error}</p>}
            {!error && loading && <p className="text-center text-xs text-soft">불러오는 중...</p>}
            {!error && !loading && paused && hasMore && (
              <button
                type="button"
                onClick={resumeLoading}
                className="h-11 w-full rounded-md border border-line text-xs font-bold"
              >
                경기 더 보기
              </button>
            )}
            {!error && !loading && !hasMore && (
              <p className="text-center text-xs text-soft">
                {matches.length === 0 ? "표시할 경기가 없습니다." : "모든 경기를 불러왔습니다."}
              </p>
            )}
          </div>
        </div>
      </div>

      <ScrollToTopButton />
      <BottomNav active="home" />
    </div>
  );
}
