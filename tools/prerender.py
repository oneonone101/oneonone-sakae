"""本番用の dist/ を作る。
1. build.py で下層ページを組み立て
2. ヘッドレスブラウザで各ページを開き、JavaScript で描画された状態の HTML を保存（検索エンジン向け）
3. プレビュー専用の表示（PREVIEWバー・要確認ラベル）を除去し、リンクを /party などのきれいなURLに変える
4. sitemap.xml / robots.txt / _headers（Cloudflare Pages 用）を書き出す
使い方: python3 tools/prerender.py
"""
import datetime, pathlib, re, shutil, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
SITE_URL = "https://oneonone-sakae.jp"
GA_ID = ""  # 例 "G-XXXXXXXXXX"。Google アナリティクス作成後に入れる
PAGES = ["index", "bonenkai", "party", "anniversary", "course", "space", "food", "access"]
PRIORITY = {"index": "1.0", "bonenkai": "0.9", "party": "0.9", "anniversary": "0.8", "course": "0.8"}
HOME_TITLE = "栄の宴会・個室・貸切・誕生日ディナー｜肉ビストロ ONE on ONE（名古屋・錦）"

HOME_HEAD = f"""<link rel="canonical" href="{SITE_URL}/">
<meta property="og:title" content="{HOME_TITLE}">
<meta property="og:description" content="名古屋・栄の個室×肉ビストロ。10名の部署宴会から100名を超える貸切パーティーまで、飲み放題付きコースで宴会スタイルをご提案。誕生日・記念日のバースデープレートも。栄駅徒歩5分、翌5時まで営業。">
<meta property="og:type" content="website">
<meta property="og:url" content="{SITE_URL}/">
<meta property="og:image" content="{SITE_URL}/og.jpg">
<meta property="og:site_name" content="ONE on ONE">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">"""

GA_SNIPPET = f"""<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','{GA_ID}');</script>"""


def wrap_home(src: str) -> str:
    """index.html はプレビュー用に head/body を省いているので、本番用に包む"""
    head, body = src.split('<div class="previewbar"', 1)
    head = head.replace("<title>ONE on ONE 栄</title>", f"<title>{HOME_TITLE}</title>")
    head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
    return ('<!doctype html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
            + head + HOME_HEAD + "\n</head>\n<body>\n" + '<div class="previewbar"' + body + "\n</body>\n</html>\n")


CLEANUP_JS = """() => {
  document.querySelectorAll('.previewbar, [data-preview], .chk').forEach(n => n.remove());
  document.body.classList.remove('show-chk');
  document.documentElement.classList.add('is-live');
  document.querySelectorAll('.mapcard .ph').forEach(ph => {
    const f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=' + encodeURIComponent('愛知県名古屋市中区錦3-10-21 プロシーム錦') + '&output=embed';
    f.title = 'ONE on ONE の地図'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    f.style.cssText = 'width:100%;aspect-ratio:4/3;border:0;filter:grayscale(.3) brightness(.9)';
    ph.replaceWith(f);
  });
  document.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    const m = h.match(/^([a-z]+)\\.html(#.*)?$/);
    if (m) a.setAttribute('href', (m[1] === 'index' ? '/' : '/' + m[1]) + (m[2] || ''));
  });
}"""


def make_og(path):
    """SNS 共有用の画像（1200×630）を店内写真から作る"""
    from PIL import Image, ImageDraw, ImageFont, ImageEnhance
    im = Image.open(ROOT / "photos" / "floor.jpg").convert("RGB")
    w, h = im.size
    target = 1200 / 630
    if w / h > target:
        nw = int(h * target); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / target); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize((1200, 630), Image.LANCZOS)
    im = ImageEnhance.Brightness(im).enhance(0.62)
    d = ImageDraw.Draw(im)
    def font(names, size):
        for n in names:
            try:
                return ImageFont.truetype(n, size)
            except OSError:
                continue
        return ImageFont.load_default()
    serif = font(["/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"], 76)
    small = font(["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"], 24)
    d.text((70, 430), "ONE on ONE", font=serif, fill=(231, 214, 174))
    d.text((74, 530), "MEAT BISTRO & BAR  ·  SAKAE, NAGOYA", font=small, fill=(200, 167, 106))
    im.save(path, quality=85, optimize=True)


def main():
    subprocess.run([sys.executable, "build.py"], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    tmp = ROOT / ".prerender"
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir()
    for f in ["styles.css", "data.js", "common.js", "logo.svg"]:
        shutil.copy(ROOT / f, tmp / f)
        shutil.copy(ROOT / f, DIST / f)
    (DIST / "photos").mkdir()
    for img in (ROOT / "photos").glob("*.jpg"):
        shutil.copy(img, DIST / "photos" / img.name)
    shutil.copytree(ROOT / "photos", tmp / "photos", ignore=shutil.ignore_patterns("incoming"))
    for p in PAGES:
        src = (ROOT / f"{p}.html").read_text("utf-8")
        (tmp / f"{p}.html").write_text(wrap_home(src) if p == "index" else src, "utf-8")

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page()
        page.route(re.compile(r"^https?://"), lambda r: r.abort())  # 外部（フォント等）は読まない
        for p in PAGES:
            page.goto((tmp / f"{p}.html").as_uri(), wait_until="load")
            page.evaluate(CLEANUP_JS)
            html = "<!doctype html>\n" + page.content()
            if GA_ID:
                html = html.replace("</head>", GA_SNIPPET + "\n</head>", 1)
            (DIST / f"{p}.html").write_text(html, "utf-8")
            print("rendered", p)
        browser.close()
    shutil.rmtree(tmp)

    today = datetime.date.today().isoformat()
    urls = "\n".join(
        f"  <url><loc>{SITE_URL}{'/' if p == 'index' else '/' + p}</loc><lastmod>{today}</lastmod><priority>{PRIORITY.get(p, '0.6')}</priority></url>"
        for p in PAGES)
    (DIST / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n', "utf-8")
    (DIST / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: {SITE_URL}/sitemap.xml\n", "utf-8")
    make_og(DIST / "og.jpg")
    shutil.copy(ROOT / "favicon.svg", DIST / "favicon.svg")
    (DIST / "_headers").write_text(
        "# pages.dev は公開用ドメインの複製なので検索に出さない\n"
        "https://oneonone-sakae.pages.dev/*\n  X-Robots-Tag: noindex\n"
        "https://:version.oneonone-sakae.pages.dev/*\n  X-Robots-Tag: noindex\n"
        "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n" +
        "/*.css\n  Cache-Control: public, max-age=3600\n/*.js\n  Cache-Control: public, max-age=3600\n/photos/*\n  Cache-Control: public, max-age=86400\n", "utf-8")
    print("dist ready")


if __name__ == "__main__":
    main()
