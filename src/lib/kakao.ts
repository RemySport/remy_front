export const KAKAO_CALLBACK_PATH = "/login/kakao/callback";

/** 카카오 개발자 콘솔에 로컬/배포 도메인 각각 이 경로로 redirect URI를 등록해야 한다. */
export function getKakaoRedirectUri(): string {
  return `${window.location.origin}${KAKAO_CALLBACK_PATH}`;
}

export function buildKakaoAuthorizeUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID ?? "",
    redirect_uri: getKakaoRedirectUri(),
    response_type: "code",
  });
  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}
