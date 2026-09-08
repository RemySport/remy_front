/**
 * 카카오(다음) 우편번호 서비스 연동.
 * https://postcode.map.daum.net/guide 에서 제공하는 스크립트를 그대로 붙여 쓰는 방식으로,
 * 별도 백엔드 없이 클라이언트에서만 동작한다 (output: "export" 정적 배포와도 호환).
 */

export type DaumPostcodeResult = {
  /** 우편번호 (5자리) */
  zonecode: string;
  /** 화면에 보여줄 대표 주소 — 도로명 주소가 있으면 그걸, 없으면 지번 주소를 쓴다. */
  address: string;
  roadAddress: string;
  jibunAddress: string;
};

type RawDaumPostcodeData = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
};

type DaumPostcodeInstance = {
  embed: (element: HTMLElement, options?: { autoClose?: boolean }) => void;
};

type DaumPostcodeConstructor = new (options: {
  oncomplete: (data: RawDaumPostcodeData) => void;
  width?: string | number;
  height?: string | number;
}) => DaumPostcodeInstance;

declare global {
  interface Window {
    daum?: {
      Postcode: DaumPostcodeConstructor;
    };
  }
}

const SCRIPT_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

let loadPromise: Promise<void> | null = null;

/** 스크립트를 최초 1회만 불러오고, 이후 호출은 같은 Promise를 공유한다. */
export function loadDaumPostcodeScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저에서만 사용할 수 있습니다."));
  }
  if (window.daum?.Postcode) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("우편번호 서비스를 불러오지 못했습니다.")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("우편번호 서비스를 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function embedDaumPostcode(
  container: HTMLElement,
  onComplete: (result: DaumPostcodeResult) => void
): DaumPostcodeInstance {
  if (!window.daum) throw new Error("우편번호 서비스가 아직 준비되지 않았습니다.");
  const postcode = new window.daum.Postcode({
    oncomplete: (data) => {
      onComplete({
        zonecode: data.zonecode,
        address: data.roadAddress || data.jibunAddress,
        roadAddress: data.roadAddress,
        jibunAddress: data.jibunAddress,
      });
    },
    width: "100%",
    height: "100%",
  });
  postcode.embed(container, { autoClose: false });
  return postcode;
}
