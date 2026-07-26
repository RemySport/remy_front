/**
 * 상세 화면들의 "뒤로가기"는 href 하나로 고정된 목적지를 향하는 Link 라, 같은 목적지를
 * 여러 경로로 거쳐 들어오면(예: 메뉴 -> 공지사항 -> 뒤로가기 -> 메뉴) 실제 브라우저
 * 히스토리와 어긋나는 새 항목이 계속 쌓인다. 이 앱 안에서 실제로 뒤로 갈 히스토리가
 * 있는지 판단해, 있으면 router.back() 으로 진짜 뒤로가기를 쓰고 없으면(직접 URL 진입 등)
 * href 로 폴백한다.
 */

// 지연 계산하면 "이 세션 첫 뒤로가기 클릭"이 기준값을 그 시점 길이로 잡아버려 항상
// false 가 되므로, 이 모듈이 처음 로드되는 시점(=탭에서 앱이 뜬 시점)에 바로 읽어둔다.
const baseHistoryLength = typeof window === "undefined" ? 0 : window.history.length;

export function canGoBack(): boolean {
  if (typeof window === "undefined") return false;
  return window.history.length > baseHistoryLength;
}
