/**
 * 무한스크롤 목록의 "뒤로가기 복원"용 스냅샷 저장소.
 *
 * 이 앱은 `output: "export"` 정적 배포라 목록 데이터가 전부 클라이언트 fetch로 채워진다.
 * 상세/예약 화면에 갔다가 뒤로 돌아오면 컴포넌트가 새로 마운트되면서 1페이지부터 다시
 * 시작하므로, 불러온 항목·페이지 번호·스크롤 위치를 sessionStorage에 남겨두고 복원한다.
 * (탭을 닫으면 사라지는 세션 범위가 적절하다.)
 */

export type ListSnapshot<T> = { data: T; scrollY: number };

export function readListSnapshot<T>(key: string): ListSnapshot<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ListSnapshot<T>) : null;
  } catch {
    return null;
  }
}

export function saveListSnapshot<T>(key: string, data: T, scrollY: number) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify({ data, scrollY }));
  } catch {
    // 용량 초과 등은 "복원이 안 될 뿐"이라 조용히 넘긴다.
  }
}

export function clearListSnapshot(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // 무시
  }
}
