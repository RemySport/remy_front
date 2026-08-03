// CloudFront Function (runtime: cloudfront-js-2.0, event: viewer request)
//
// next build 의 output:"export" 는 라우트를 평평한 .html 파일로 내보낸다.
//   /        -> out/index.html
//   /faq     -> out/faq.html
//   /login/kakao/callback -> out/login/kakao/callback.html
// S3 REST 오리진은 확장자 없는 키를 못 찾고 403 을 내므로 여기서 리라이트한다.
//
// _next/static/*.js, __next.*.txt 처럼 마지막 세그먼트에 점이 있는 요청은 건드리지 않는다.
//
// 이 파일은 형상 관리용 사본이다. 수정 후 CloudFront 콘솔의 Function 에도 반영하고
// Publish 까지 해야 적용된다.
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
    return request;
  }

  var lastSegment = uri.substring(uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') === -1) {
    request.uri = uri + '.html';
  }

  return request;
}
