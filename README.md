# Remy Customer Frontend

경기 티켓 탐색, 예약과 결제, 주문 상태, 굿즈와 사용자 프로필을 제공하는 고객용 Next.js 웹이다.

## 기술 구성

- Next.js 16 App Router
- React 19, TypeScript strict
- Tailwind CSS 4
- 정적 export 후 S3/CloudFront 배포

## 로컬 실행

```powershell
Copy-Item .env.local.example .env.local
npm ci
npm run dev
```

`.env.local`에는 공개 빌드 설정만 넣는다.

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KAKAO_CLIENT_ID=...
```

`NEXT_PUBLIC_*`는 브라우저에 노출된다. Payple `custKey`, 환불 키, 웹훅 토큰과 서버 비밀값을 넣으면 안 된다.

## 검증

```powershell
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

현재 자동화 테스트 스크립트는 없다. 정적 route를 추가하면 클라이언트 이동뿐 아니라 S3/CloudFront에서 직접 URL 접근과 새로고침도 확인한다.

## 결제 연동 상태

현재 화면은 제거된 레거시 결제/저장 결제수단 API를 호출한다. 실제 결제를 시작하기 전에 다음 계약을 구현해야 한다.

1. `ticketOptionId`가 포함된 예약 생성
2. `POST /payments/prepare`
3. Payple 결제창 인증
4. `POST /payments/approve`
5. `GET /payments/{orderId}` 상태 확인
6. PC callback과 모바일 `/payments/result` 복귀

결제 금액과 주문번호는 서버 응답을 기준으로 사용하고, 결과 불명 상태를 실패로 단정하지 않는다. 상세 규칙은 [AGENTS.md](AGENTS.md)를 참고한다.
