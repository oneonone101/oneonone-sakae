"""下層ページを共通レイアウトで組み立てる（本番の Next.js では app/layout.tsx に相当）
使い方: python3 build.py  →  party.html / anniversary.html / course.html を生成
各ページの本文は src/<slug>.main.html、ページ用スクリプトは src/<slug>.js
"""
import json, pathlib

SITE_URL = "https://oneonone-sakae.jp"
SRC = pathlib.Path("src")

NAV = [
    ("party", "party.html", "PARTY", "宴会・貸切"),
    ("anniversary", "anniversary.html", "ANNIVERSARY", "誕生日・記念日"),
    ("course", "course.html", "COURSE", "コース"),
    ("space", "space.html", "SPACE", "店内・個室"),
    ("food", "food.html", "FOOD", "料理"),
    ("access", "access.html", "ACCESS", "アクセス・料金"),
]

DOCK_BOOK = [("#", "primary", "RESERVE", "ネット予約", 'data-open-book data-loc="dock"'),
             ("#reserve", "", "GROUP", "団体・貸切相談", 'data-track="group_inquiry_click" data-loc="dock"')]
DOCK_PARTY = [("#hire", "primary", "PRICE", "貸切料金", 'data-track="hire_price_click" data-loc="dock"'),
              ("#reserve", "", "CONTACT", "相談フォーム", 'data-track="group_inquiry_click" data-loc="dock"')]

PAGES = [
    dict(slug="party", crumb="宴会・貸切", dock=DOCK_PARTY,
         title="栄の宴会・貸切パーティー｜個室×肉ビストロ ONE on ONE",
         desc="名古屋・栄で宴会・貸切会場をお探しの幹事様へ。8名・15名の個室、40名までの半個室、着席106席・立食130名の貸切。日付を選ぶだけで貸切料金がわかります。栄駅徒歩5分。",
         note="写真は仮枠です。貸切料金は2025年の料金表に5万円を加えた暫定値です。"),
    dict(slug="anniversary", crumb="誕生日・記念日", dock=DOCK_BOOK,
         title="栄の誕生日・記念日ディナー｜バースデープレートと個室 ONE on ONE",
         desc="名古屋・栄で誕生日や記念日のディナーなら。メッセージ入りバースデープレート、テーブルアートのサプライズ、カップルシートや完全個室。ANNIVERSARYコース7,000円（飲み放題付）。",
         note="写真は仮枠です。"),
    dict(slug="course", crumb="コース", dock=DOCK_BOOK,
         title="コース・飲み放題プラン｜栄の個室×肉ビストロ ONE on ONE",
         desc="ONE on ONEの飲み放題付きコース一覧。STANDARD 4,000円から、GRADEUP、PREMIUM、ANNIVERSARY、二次会コースまで。品数・飲み放題時間・12月の内容を比較できます。",
         note="写真は仮枠です。価格はグルメサイト掲載時点の内容です。"),
    dict(slug="space", crumb="店内・個室", dock=DOCK_BOOK,
         title="店内・個室｜栄の個室イタリアン ONE on ONE",
         desc="シャンデリアと大理石のヴィンテージモダンな店内。大理石カウンターのカップルシート、8名・15名の完全個室、20名×2卓の大理石テーブル、着席106席・立食130名の貸切フロア。",
         note="写真は仮枠です。"),
    dict(slug="food", crumb="料理・ドリンク", dock=DOCK_BOOK,
         title="料理・ドリンク｜栄の肉ビストロ ONE on ONE",
         desc="厳選牛のグリル、サーモンのレアカツ、生ウニのクリームリゾットなど。肉料理を中心にしたイタリアンと、ワイン・シャンパン・カクテル。",
         note="写真は仮枠です。メニューは一部のみ掲載しています。"),
    dict(slug="access", crumb="アクセス", dock=DOCK_BOOK,
         title="アクセス・営業時間｜栄駅徒歩5分 ONE on ONE",
         desc="ONE on ONEへのアクセス。地下鉄栄駅から徒歩5分、名古屋市中区錦3-10-21 プロシーム錦2F。営業時間は月〜土18:00〜翌5:00、日祝18:00〜翌3:00。料金・チャージ・お支払い方法。",
         note="写真は仮枠です。"),
]

FONTS = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Shippori+Mincho:wght@500;600&family=Zen+Kaku+Gothic+New:wght@400;500&family=Jost:wght@400;500&display=swap"


def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")


def build(p):
    slug = p["slug"]
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "HOME", "item": SITE_URL + "/"},
        {"@type": "ListItem", "position": 2, "name": p["crumb"], "item": f"{SITE_URL}/{slug}"}]}
    extra_head = (SRC / f"{slug}.head.html").read_text("utf-8") if (SRC / f"{slug}.head.html").exists() else ""
    extra_head = "\n".join(b for b in extra_head.split("</script>\n") if "BreadcrumbList" not in b and b.strip())
    if extra_head and not extra_head.rstrip().endswith("</script>"):
        extra_head += "</script>"
    main = (SRC / f"{slug}.main.html").read_text("utf-8")
    js = (SRC / f"{slug}.js").read_text("utf-8")
    nav = "\n      ".join(
        f'<a href="{href}"' + (' aria-current="page"' if key == slug else "") + f">{en}</a>" for key, href, en, ja in NAV)
    drawer = "\n      ".join(f'<a href="{href}"><span>{en}</span><small>{ja}</small></a>' for key, href, en, ja in NAV)
    dock = "\n    ".join(
        f'<a href="{href}"' + (f' class="{cls}"' if cls else "") + f" {attrs}><span>{en}</span>{ja}</a>"
        for href, cls, en, ja, attrs in p["dock"])
    html = f"""<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(p["title"])}</title>
<meta name="description" content="{esc(p["desc"])}">
<link rel="canonical" href="{SITE_URL}/{slug}">
<meta property="og:title" content="{esc(p["title"])}">
<meta property="og:description" content="{esc(p["desc"])}">
<meta property="og:type" content="website">
<meta property="og:url" content="{SITE_URL}/{slug}">
<meta property="og:image" content="{SITE_URL}/og.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="styles.css">
<style>:root {{ padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }} body {{ margin: 0; }} img {{ max-width: 100%; }} [hidden] {{ display: none !important; }} nav.global a[aria-current] {{ color: var(--champagne); opacity: 1; }}</style>
<script type="application/ld+json">{json.dumps(crumbs, ensure_ascii=False)}</script>
{extra_head}
</head>
<body>
<div class="previewbar" role="note">
  <div class="wrap">
    <span>PREVIEW — {p["note"]}</span>
    <label><input type="checkbox" id="toggle-chk"> 要確認の項目をハイライト</label>
  </div>
</div>

<header class="site">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="ONE on ONE ホーム">
      <span class="en">ONE<i>on</i>ONE</span>
      <span>NISHIKI · SAKAE · NAGOYA</span>
    </a>
    <nav class="global" aria-label="グローバルナビゲーション">
      {nav}
    </nav>
    <div class="head-cta">
      <a class="btn" href="party.html#reserve" data-track="group_inquiry_click" data-loc="header">団体・貸切相談</a>
      <button class="btn solid" type="button" data-open-book data-loc="header">ネット予約</button>
    </div>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="drawer" id="menu-btn">MENU</button>
  </div>
  <div class="drawer" id="drawer" hidden>
    <div class="wrap">
      {drawer}
    </div>
  </div>
</header>

<div class="season" id="season"></div>

<main>
  <nav class="crumbs wrap" aria-label="パンくずリスト">
    <ol><li><a href="index.html">HOME</a></li><li aria-current="page">{p["crumb"]}</li></ol>
  </nav>
{main}
</main>

<footer>
  <div class="wrap">
    <a class="logo" href="index.html"><span class="en">ONE<i>on</i>ONE</span><span>個室×肉ビストロ · 名古屋 栄</span></a>
    <nav aria-label="フッターナビゲーション">
      <a href="index.html">HOME</a><a href="party.html">PARTY</a><a href="anniversary.html">ANNIVERSARY</a><a href="course.html">COURSE</a><a href="space.html">SPACE</a><a href="food.html">FOOD</a><a href="access.html">ACCESS</a>
    </nav>
    <p>愛知県名古屋市中区錦3-10-21 プロシーム錦2F ／ 20歳未満の方は禁煙席のみご案内しています。</p>
    <p>© ONE on ONE</p>
  </div>
</footer>

<div class="dock" aria-label="予約メニュー">
  <div class="row">
    {dock}
    <a href="" data-tel-link data-track="tel_click" data-loc="dock"><span>TEL</span>電話</a>
  </div>
</div>

<div class="sheet" id="sheet" hidden role="dialog" aria-modal="true" aria-labelledby="sheet-title">
  <div class="sheet-in">
    <h3 id="sheet-title">予約サイトを選んでください</h3>
    <p class="note">どちらも空席確認・コース予約ができます（新しいタブで開きます）。</p>
    <a class="btn solid" href="" data-book="hotpepper" target="_blank" rel="noopener" data-track="reserve_click" data-loc="sheet">ホットペッパーで予約</a>
    <a class="btn" href="" data-book="tabelog" target="_blank" rel="noopener" data-track="reserve_click" data-loc="sheet">食べログで予約</a>
    <button class="close" type="button" id="sheet-close">閉じる</button>
  </div>
</div>

<script src="data.js"></script>
<script src="common.js"></script>
<script>
/* {slug.upper()} page */
{js}</script>
</body>
</html>
"""
    pathlib.Path(f"{slug}.html").write_text(html, "utf-8")
    print("built", slug)


for p in PAGES:
    if (SRC / f"{p['slug']}.main.html").exists():
        build(p)
