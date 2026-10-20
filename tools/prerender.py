"""本番用の dist/ を作る。
1. build.py で下層ページを組み立て
2. ヘッドレスブラウザで各ページを開き、JavaScript で描画された状態の HTML を保存（検索エンジン向け）
3. プレビュー専用の表示（PREVIEWバー・要確認ラベル）を除去し、リンクを /party などのきれいなURLに変える
4. sitemap.xml / robots.txt / vercel.json を書き出す
使い方: python3 tools/prerender.py
"""
import datetime, pathlib, re, shutil, subprocess, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
SITE_URL = "https://oneonone-sakae.jp"
GA_ID = ""  # 例 "G-XXXXXXXXXX"。Google アナリティクス作成後に入れる
PAGES = ["index", "party", "anniversary", "course", "space", "food", "access"]
PRIORITY = {"index": "1.0", "party": "0.9", "anniversary": "0.8", "course": "0.8"}

HOME_HEAD = f"""<link rel="canonical" href="{SITE_URL}/">
<meta property="og:title" content="ONE on ONE｜栄の個室×肉ビストロ 宴会・貸切・記念日">
<meta property="og:description" content="名古屋・栄の個室×肉ビストロ。忘年会などの宴会、立食130名の貸切、誕生日・記念日のサプライズまで。栄駅徒歩5分、深夜まで営業。">
<meta property="og:type" content="website">
<meta property="og:url" content="{SITE_URL}/">
<meta property="og:image" content="{SITE_URL}/og.jpg">"""

GA_SNIPPET = f"""<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','{GA_ID}');</script>"""


def wrap_home(src: str) -> str:
    """index.html はプレビュー用に head/body を省いているので、本番用に包む"""
    head, body = src.split('<div class="previewbar"', 1)
    head = head.replace("<title>ONE on ONE 栄</title>", "<title>ONE on ONE｜栄の個室×肉ビストロ 宴会・貸切・記念日</title>")
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


def main():
    subprocess.run([sys.executable, "build.py"], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    tmp = ROOT / ".prerender"
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir()
    for f in ["styles.css", "data.js", "common.js"]:
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
    print("dist ready")


if __name__ == "__main__":
    main()
