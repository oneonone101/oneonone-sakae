"""下層ページを共通レイアウトで組み立てる（本番の Next.js では app/layout.tsx に相当）
使い方: python3 build.py  →  party.html / anniversary.html / course.html を生成
各ページの本文は src/<slug>.main.html、ページ用スクリプトは src/<slug>.js
"""
import json, pathlib

SITE_URL = "https://oneonone-sakae.jp"
SRC = pathlib.Path("src")

NAV = [
    ("bonenkai", "bonenkai.html", "YEAR-END", "忘年会・新年会"),
    ("party", "party.html", "PARTY", "宴会・貸切"),
    ("anniversary", "anniversary.html", "ANNIVERSARY", "誕生日・記念日"),
    ("course", "course.html", "COURSE", "コース"),
    ("space", "space.html", "SPACE", "店内・個室"),
    ("food", "food.html", "FOOD", "料理"),
    ("access", "access.html", "ACCESS", "アクセス・料金"),
]

BOOK = ("#", "primary", "RESERVE", "ネット予約", 'data-open-book data-loc="dock"')
DOCK_BOOK = [BOOK, ("party.html#reserve", "", "GROUP", "団体・貸切相談", 'data-track="group_inquiry_click" data-loc="dock"')]
DOCK_PARTY = [BOOK, ("#hire", "", "PRICE", "貸切料金・相談", 'data-track="hire_price_click" data-loc="dock"')]
DOCK_FORM = [BOOK, ("#reserve", "", "GROUP", "団体・貸切相談", 'data-track="group_inquiry_click" data-loc="dock"')]

PAGES = [
    dict(slug="bonenkai", crumb="忘年会・新年会", dock=DOCK_FORM, form_purpose="忘年会・新年会",
         form_intro="忘年会・新年会のご相談はこちらから。人数・日程・ご予算をお書きください。",
         title="栄の忘年会 2026｜個室・飲み放題付き¥5,000〜・貸切130名 ONE on ONE",
         desc="名古屋・栄で忘年会・新年会のお店をお探しの幹事様へ。12月の宴会コースは飲み放題付き5,000円〜。15名の完全個室、12名・16名の半個室、40名までの大理石テーブル、40名以上の大型忘年会、130名までの貸切。栄駅徒歩5分。"),
    dict(slug="party", crumb="宴会・貸切", dock=DOCK_PARTY,
         title="栄の宴会・個室宴会・貸切｜20名・30名・50名以上も ONE on ONE",
         desc="名古屋・栄で宴会会場をお探しの幹事様へ。10〜20名は個室・半個室、20〜40名は大理石テーブル、40名以上の大型宴会も飲み放題付きコースで。貸切は着席最大104名・立食最大130名の最低保証料金制。栄駅徒歩5分。"),
    dict(slug="anniversary", crumb="誕生日・記念日", dock=DOCK_BOOK,
         title="栄の誕生日ディナー・記念日の個室｜バースデープレート ONE on ONE",
         desc="名古屋・栄で誕生日や記念日のディナーなら。メッセージ入りバースデープレート2,200円、テーブルアート3,850円、2名から使える個室。ANNIVERSARYコース7,000円（飲み放題付）。"),
    dict(slug="course", crumb="コース", dock=DOCK_BOOK,
         title="宴会コース・飲み放題｜12月料金あり 栄 ONE on ONE",
         desc="ONE on ONEの飲み放題付き宴会コース。12月は5,000円〜、1〜11月は4,000円〜（日〜木）。GRADEUP、PREMIUM、ANNIVERSARY、22時からの二次会コースまで比較できます。"),
    dict(slug="space", crumb="店内・個室", dock=DOCK_BOOK,
         title="栄の個室・半個室・貸切スペース｜2〜130名 ONE on ONE",
         desc="シャンデリアと大理石のヴィンテージモダンな店内。8名・15名の完全個室、12名・16名の半個室、20名×2卓の大理石テーブル、着席最大104名・立食最大130名の貸切フロア。"),
    dict(slug="food", crumb="料理・ドリンク", dock=DOCK_BOOK,
         title="料理・ドリンクメニュー｜栄の肉ビストロ ONE on ONE",
         desc="黒毛和牛イチボのグリル、サーモンレアカツ、生ウニのクリームリゾットなど全68品。肉料理を中心にしたイタリアンと、ワイン・シャンパン・オリジナルカクテル。"),
    dict(slug="access", crumb="アクセス", dock=DOCK_BOOK,
         title="アクセス・営業時間｜栄駅徒歩5分 名古屋市中区錦 ONE on ONE",
         desc="ONE on ONEへのアクセス。地下鉄栄駅から徒歩5分、名古屋市中区錦3-10-21 プロシーム錦2F。月〜土18:00〜翌5:00、日祝18:00〜翌3:00。チャージ・お支払い方法。"),
    dict(slug="privacy", crumb="プライバシーポリシー", dock=DOCK_BOOK,
         title="プライバシーポリシー｜ONE on ONE 栄",
         desc="株式会社LCが運営するONE on ONE（名古屋・栄）の個人情報の取り扱いについて。団体・貸切相談フォームでお預かりする情報の利用目的、外部サービス、アクセス解析、お問い合わせ窓口。"),
]

FONTS = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Shippori+Mincho:wght@500;600&family=Zen+Kaku+Gothic+New:wght@400;500&family=Jost:wght@400;500&display=swap"


def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")


RESTAURANT_ID = SITE_URL + "/#restaurant"


def page_ld(p):
    """各ページの WebPage（店舗の Restaurant をトップで定義し @id で参照）"""
    return {"@context": "https://schema.org", "@type": "WebPage", "url": f"{SITE_URL}/{p['slug']}",
            "name": p["title"], "description": p["desc"], "inLanguage": "ja",
            "about": {"@id": RESTAURANT_ID}, "isPartOf": {"@type": "WebSite", "url": SITE_URL + "/", "name": "ONE on ONE"}}


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
    if "<!--FORM-->" in main:
        form = (SRC / "_form.html").read_text("utf-8").replace("{FORM_INTRO}", p.get("form_intro", "10名以上の宴会・貸切・二次会のご相談はこちらから。"))
        purpose = p.get("form_purpose")
        if purpose:
            form = form.replace(f"<option>{purpose}</option>", f"<option selected>{purpose}</option>", 1)
        main = main.replace("<!--FORM-->", form)
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
<meta property="og:site_name" content="ONE on ONE">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="styles.css">
<style>:root {{ padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }} body {{ margin: 0; }} img {{ max-width: 100%; }} [hidden] {{ display: none !important; }} nav.global a[aria-current] {{ color: var(--champagne); opacity: 1; }}</style>
<script type="application/ld+json">{json.dumps(crumbs, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(page_ld(p), ensure_ascii=False)}</script>
{extra_head}
</head>
<body>
<div class="previewbar" role="note">
  <div class="wrap">
    <span>PREVIEW — 公開版ではこの帯と「要確認」の表示は出ません。</span>
    <label><input type="checkbox" id="toggle-chk"> 要確認の項目をハイライト</label>
  </div>
</div>

<header class="site">
  <div class="wrap">
    <a class="logo" href="index.html" aria-label="ONE on ONE ホーム">
      <img class="logo-mark" src="logo.svg" alt="ONE on ONE" width="150" height="30">
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
    <a class="logo" href="index.html"><img class="logo-mark" src="logo.svg" alt="ONE on ONE" width="150" height="30"><span>個室×肉ビストロ · 名古屋 栄</span></a>
    <nav aria-label="フッターナビゲーション">
      <a href="index.html">HOME</a><a href="bonenkai.html">YEAR-END</a><a href="party.html">PARTY</a><a href="anniversary.html">ANNIVERSARY</a><a href="course.html">COURSE</a><a href="space.html">SPACE</a><a href="food.html">FOOD</a><a href="access.html">ACCESS</a><a href="privacy.html">PRIVACY</a>
    </nav>
    <p>ONE on ONE（ワンオンワン）／ 愛知県名古屋市中区錦3-10-21 プロシーム錦2F ／ TEL <span data-tel-text></span> ／ 地下鉄栄駅 徒歩5分<br>月〜土・祝前日 18:00〜翌5:00、日・祝 18:00〜翌3:00 ／ 20歳未満の方は禁煙席のみご案内しています。</p>
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
    <p class="note">どちらも空席確認・コース予約ができます（新しいタブで開きます）。受け付けられる人数は各サイトの表示をご確認ください。大人数のご相談はフォームかお電話でも承ります。</p>
    <a class="btn solid" href="" data-book="hotpepper" target="_blank" rel="noopener" data-track="reserve_click" data-loc="sheet">ホットペッパーで予約</a>
    <a class="btn" href="" data-book="tabelog" target="_blank" rel="noopener" data-track="reserve_click" data-loc="sheet">食べログで予約</a>
    <p class="sheet-month" id="sheet-month" hidden>予約サイトの日付カレンダーで<b>12月</b>を選んでください。12月の金・土は早めに埋まります。満席の日は、お電話かフォームでご相談ください。</p>
    <p class="note sheet-tel">お電話でも承ります　<a href="" data-tel data-track="tel_click" data-loc="sheet"></a>（17:00〜）</p>
    <a class="textlink sheet-form" id="sheet-form" href="party.html#reserve" data-track="group_inquiry_click" data-loc="sheet">40名以上の団体宴会・貸切はフォームでご相談</a>
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
