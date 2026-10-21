// 公開アドレスを https://oneonone-sakae.jp に一本化する。
// oneonone-sakae.pages.dev と www.oneonone-sakae.jp で開かれたページは、同じパスの oneonone-sakae.jp へ 301 で移動させる。
// お試し版（design-warm.oneonone-sakae.pages.dev など）とフォーム送信（POST）は移動させない。
const CANONICAL = "oneonone-sakae.jp";
const REDIRECT_HOSTS = new Set(["oneonone-sakae.pages.dev", "www.oneonone-sakae.jp"]);

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  if (REDIRECT_HOSTS.has(url.hostname) && (request.method === "GET" || request.method === "HEAD")) {
    url.hostname = CANONICAL;
    url.protocol = "https:";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
