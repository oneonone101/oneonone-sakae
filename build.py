"""全ページを共通レイアウトで組み立てる（本番の Next.js では app/layout.tsx に相当）
使い方: python3 build.py  →  index.html / party.html / hire.html / course-*.html などを生成
各ページの本文は src/<slug>.main.html、ページ用スクリプトは src/<slug>.js、追加の head は src/<slug>.head.html
コース詳細ページ（course-<id>.html）は data.js のコースから src/course-detail.* を使って自動で作る
"""
import json, pathlib, subprocess

SITE_URL = "https://oneonone-sakae.jp"
SRC = pathlib.Path("src")

# スマホでも常に見える主要メニュー（5項目）。key は「現在地」表示に使う
PRIMARY_NAV = [
    ("course", "course.html", "コース"),
    ("party", "party.html", "宴会・貸切"),
    ("space", "space.html", "お席"),
    ("anniversary", "anniversary.html", "記念日"),
    ("access", "access.html", "店舗情報"),
]
# メニュー（ドロワー）の2段目
MORE_NAV = [
    ("bonenkai", "bonenkai.html", "忘年会・新年会"),
    ("hire", "hire.html", "貸切パーティー"),
    ("afterparty", "afterparty.html", "二次会"),
    ("food", "food.html", "料理・ドリンク"),
    ("index", "index.html", "ホーム"),
]
# どのページがどの主要メニューに属するか（現在地の表示）
SECTION = {"party": "party", "hire": "party", "bonenkai": "party", "afterparty": "party",
           "course": "course", "space": "space", "anniversary": "anniversary", "access": "access", "food": "access"}

BOOK = ("#", "primary", "ネット予約", 'data-open-book data-loc="dock"')
DOCK_DEFAULT = [BOOK, ("hire.html", "", "貸切相談", 'data-track="group_guide_click" data-loc="dock"')]
DOCK_HIRE = [BOOK, ("#reserve", "", "相談フォーム", 'data-track="group_inquiry_click" data-loc="dock"')]

HOME_TITLE = "栄の宴会・個室・貸切・誕生日ディナー｜肉ビストロ ONE on ONE（名古屋・錦）"
HOME_DESC = "名古屋・栄の個室×肉ビストロ ONE on ONE。飲み放題付きの宴会コース、8名・15名の完全個室、着席最大104名・立食最大130名の貸切。誕生日・記念日のデザートプレートや22時からの二次会コースも。栄駅徒歩5分、翌5時まで営業。"

PAGES = [
    dict(slug="index", crumb=None, dock=DOCK_DEFAULT, title=HOME_TITLE, desc=HOME_DESC),
    dict(slug="bonenkai", crumb="忘年会・新年会", parent=("party.html", "宴会・貸切"), dock=DOCK_DEFAULT, form_purpose="忘年会・新年会",
         form_intro="忘年会・新年会のご相談はこちらから。人数・日程・ご予算をお書きください。",
         title="栄の忘年会 2026｜個室・飲み放題付き¥5,000〜・貸切130名 ONE on ONE",
         desc="名古屋・栄で忘年会・新年会のお店をお探しの幹事様へ。12月の宴会コースは飲み放題付き5,000円〜。15名の完全個室、12名・16名の半個室、40名までの大理石テーブル、40名以上の大型忘年会、130名までの貸切。栄駅徒歩5分。"),
    dict(slug="party", crumb="宴会・貸切", dock=DOCK_DEFAULT,
         form_intro="10名以上の宴会・二次会のご相談はこちらから。貸切をご希望の場合は「貸切の希望」で選んでください。",
         title="栄の宴会・個室宴会・団体｜10名・20名・40名以上も ONE on ONE",
         desc="名古屋・栄で宴会会場をお探しの幹事様へ。10〜20名は個室・半個室、20〜40名は大理石テーブル、40名以上の大型宴会も飲み放題付きコースで。貸切は着席最大104名・立食最大130名。栄駅徒歩5分。"),
    dict(slug="hire", crumb="貸切パーティー", parent=("party.html", "宴会・貸切"), dock=DOCK_HIRE, form_purpose="貸切パーティー", form_hire="希望する",
         form_intro="貸切のご相談はこちらから。希望日・人数・フロア貸切／完全貸切のご希望をお知らせください。",
         title="栄の貸切パーティー｜着席104名・立食130名・料金表 ONE on ONE",
         desc="名古屋・栄のONE on ONEを貸切に。着席最大104名・立食最大130名。コース料理・飲み放題込みの最低保証料金制（税込・180分制）。日付別の料金表、料金シミュレーター、座席配置図、マイク・プロジェクターなどの設備。"),
    dict(slug="afterparty", crumb="二次会", parent=("party.html", "宴会・貸切"), dock=DOCK_DEFAULT,
         title="栄の二次会｜22時から・飲み放題付き¥3,300・翌5時まで ONE on ONE",
         desc="名古屋・栄で二次会・三次会なら。22時からの二次会コースは全4品・飲み放題120分で3,300円（税込）。カラオケ付きの完全個室8名・15名。月〜土・祝前日は翌5時まで営業。栄駅徒歩5分。"),
    dict(slug="anniversary", crumb="誕生日・記念日", dock=DOCK_DEFAULT,
         title="栄の誕生日ディナー・記念日の個室｜バースデープレート ONE on ONE",
         desc="名古屋・栄で誕生日や記念日のディナーなら。メッセージ入りバースデープレート2,200円、テーブルアート3,850円、2名から使える個室。ANNIVERSARYコース7,000円（飲み放題付）。"),
    dict(slug="course", crumb="コース", dock=DOCK_DEFAULT,
         title="宴会コース・飲み放題｜料金・品数で比較 栄 ONE on ONE",
         desc="ONE on ONEの飲み放題付きコースを料金・品数・飲み放題時間で比較。12月は5,000円〜、1〜11月は4,000円〜（日〜木）。通常宴会、季節限定、記念日、22時からの二次会コースまで。"),
    dict(slug="space", crumb="お席・店内", dock=DOCK_DEFAULT,
         title="栄の個室・半個室・貸切スペース｜2〜130名 ONE on ONE",
         desc="シャンデリアと大理石のヴィンテージモダンな店内。8名・15名の完全個室、12名・16名の半個室、20名×2卓の大理石テーブル、着席最大104名・立食最大130名の貸切フロア。"),
    dict(slug="food", crumb="料理・ドリンク", dock=DOCK_DEFAULT,
         title="料理・ドリンクメニュー｜栄の肉ビストロ ONE on ONE",
         desc="黒毛和牛イチボのグリル、サーモンレアカツ、生ウニのクリームリゾットなど全68品。肉料理を中心にしたイタリアンと、ワイン・シャンパン・オリジナルカクテル。"),
    dict(slug="access", crumb="店舗情報・アクセス", dock=DOCK_DEFAULT,
         title="アクセス・営業時間｜栄駅徒歩5分 名古屋市中区錦 ONE on ONE",
         desc="ONE on ONEへのアクセス。地下鉄栄駅から徒歩5分、名古屋市中区錦3-10-21 プロシーム錦2F。月〜土18:00〜翌5:00、日祝18:00〜翌3:00。チャージ・お支払い方法。"),
    dict(slug="privacy", crumb="プライバシーポリシー", dock=DOCK_DEFAULT,
         title="プライバシーポリシー｜ONE on ONE 栄",
         desc="株式会社LCが運営するONE on ONE（名古屋・栄）の個人情報の取り扱いについて。団体・貸切相談フォームでお預かりする情報の利用目的、外部サービス、アクセス解析、お問い合わせ窓口。"),
]

FONTS = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Shippori+Mincho:wght@500;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Jost:wght@400;500&display=swap"


def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")


def yen(n):
    return f"{n:,}"


RESTAURANT_ID = SITE_URL + "/#restaurant"


def url_of(slug):
    return SITE_URL + "/" if slug == "index" else f"{SITE_URL}/{slug}"


def course_pages():
    """data.js のコースごとに詳細ページの設定を作る"""
    data = json.loads(subprocess.run(["node", "tools/site_json.js"], capture_output=True, text=True, check=True).stdout)
    pages = []
    for c in data["courses"]:
        drink = "飲み放題なし" if c["drink"] == "なし" else f"飲み放題{c['drink']}"
        dec = c.get("dec")
        if c.get("decOnly"):
            price = f"12月限定 ¥{yen(c['price'])}"
        elif dec and dec["price"] != c["price"]:
            price = f"¥{yen(c['price'])}（12月は¥{yen(dec['price'])}）"
        else:
            price = f"¥{yen(c['price'])}"
        note = f"・{c['note']}" if c.get("note") else ""
        pages.append(dict(
            slug=f"course-{c['id']}", crumb=c["ja"], parent=("course.html", "コース"), dock=DOCK_DEFAULT,
            main=(SRC / "course-detail.main.html").read_text("utf-8").replace("{ID}", c["id"]),
            js=(SRC / "course-detail.js").read_text("utf-8").replace("{ID}", c["id"]),
            section="course",
            title=f"{c['ja']}（{price}・全{c['items']}品・{drink}）｜栄 ONE on ONE",
            desc=f"名古屋・栄 ONE on ONEの{c['ja']}{note}。税込{price}（1名）、料理全{c['items']}品、{drink}。{c['menu']}。人数・ご入店時間・予約条件をご確認いただけます。"))
    return pages


def page_ld(p):
    """各ページの WebPage（店舗の Restaurant をトップで定義し @id で参照）"""
    return {"@context": "https://schema.org", "@type": "WebPage", "url": url_of(p["slug"]),
            "name": p["title"], "description": p["desc"], "inLanguage": "ja",
            "about": {"@id": RESTAURANT_ID}, "isPartOf": {"@type": "WebSite", "url": SITE_URL + "/", "name": "ONE on ONE"}}


def build(p):
    slug = p["slug"]
    section = p.get("section", SECTION.get(slug, ""))
    trail = [("index.html", "HOME", SITE_URL + "/")]
    if p.get("parent"):
        href, name = p["parent"]
        trail.append((href, name, f"{SITE_URL}/{href[:-5]}"))
    ld = [page_ld(p)]
    if p["crumb"]:
        trail.append((None, p["crumb"], url_of(slug)))
        ld.insert(0, {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": name, "item": item} for i, (_, name, item) in enumerate(trail)]})
    crumbs_html = "" if not p["crumb"] else (
        '  <nav class="crumbs wrap" aria-label="パンくずリスト">\n    <ol>' +
        "".join(f'<li><a href="{h}">{n}</a></li>' if h else f'<li aria-current="page">{esc(n)}</li>' for h, n, _ in trail) +
        "</ol>\n  </nav>")

    extra_head = (SRC / f"{slug}.head.html").read_text("utf-8") if (SRC / f"{slug}.head.html").exists() else ""
    # パンくずの構造化データはここで作るので、head ファイル側の BreadcrumbList は使わない
    extra_head = "\n".join(b for b in extra_head.split("</script>\n") if "BreadcrumbList" not in b and b.strip())
    if extra_head and not extra_head.rstrip().endswith("</script>"):
        extra_head += "</script>"
    main = p.get("main") or (SRC / f"{slug}.main.html").read_text("utf-8")
    if "<!--FORM-->" in main:
        precheck = """        <nav class="precheck" aria-label="ご相談前に確認する">
          <p>ご相談の前に確認できます<small>入力した内容は保存されます</small></p>
          <a href="party.html#size">人数別の席・料金</a>
          <a href="hire.html#price">貸切料金のしくみ</a>
          <a href="hire.html#sim">貸切料金シミュレーター</a>
        </nav>"""
        form = (SRC / "_form.html").read_text("utf-8").replace("{FORM_INTRO}", p.get("form_intro", "10名以上の宴会・貸切・二次会のご相談はこちらから。")).replace("<!--PRECHECK-->", precheck)
        if p.get("form_purpose"):
            form = form.replace(f"<option>{p['form_purpose']}</option>", f"<option selected>{p['form_purpose']}</option>", 1)
        if p.get("form_hire"):
            form = form.replace(f"<option>{p['form_hire']}</option>", f"<option selected>{p['form_hire']}</option>", 1)
        main = main.replace("<!--FORM-->", form)
    js = p.get("js") or (SRC / f"{slug}.js").read_text("utf-8")

    cur = lambda key: ' aria-current="page"' if key == slug or key == section else ""
    nav = "\n      ".join(f'<a href="{h}"{cur(k)}>{n}</a>' for k, h, n in PRIMARY_NAV + MORE_NAV[:1] + MORE_NAV[3:4])
    pnav = "\n    ".join(f'<a href="{h}"{cur(k)}>{n}</a>' for k, h, n in PRIMARY_NAV)
    drawer_main = "\n        ".join(f'<a href="{h}"{cur(k)}>{n}</a>' for k, h, n in PRIMARY_NAV)
    drawer_more = "\n        ".join(f'<a href="{h}"{" aria-current=\"page\"" if k == slug else ""}>{n}</a>' for k, h, n in MORE_NAV)
    dock = "\n    ".join(
        f'<a href="{href}"' + (f' class="{cls}"' if cls else "") + f" {attrs}>{label}</a>"
        for href, cls, label, attrs in p["dock"])
    is_home = slug == "index"
    html = f"""<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(p["title"])}</title>
<meta name="description" content="{esc(p["desc"])}">
<link rel="canonical" href="{url_of(slug)}">
<meta property="og:title" content="{esc(p["title"])}">
<meta property="og:description" content="{esc(p["desc"])}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url_of(slug)}">
<meta property="og:image" content="{SITE_URL}/og.jpg">
<meta property="og:site_name" content="ONE on ONE">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="styles.css">
<style>:root {{ padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }} body {{ margin: 0; }} img {{ max-width: 100%; }} [hidden] {{ display: none !important; }}</style>
{"".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' + chr(10) for x in ld)}{extra_head}
</head>
<body class="pg-{slug}">
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
      <a class="btn" href="hire.html" data-track="group_guide_click" data-loc="header">貸切のご案内</a>
      <button class="btn solid" type="button" data-open-book data-loc="header">ネット予約</button>
    </div>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="drawer" id="menu-btn"><span class="bars" aria-hidden="true"></span><span class="lbl">MENU</span></button>
  </div>
  <div class="drawer" id="drawer" hidden>
    <div class="wrap">
      <nav class="drawer-main" aria-label="主要メニュー">
        {drawer_main}
      </nav>
      <nav class="drawer-more" aria-label="その他のページ">
        {drawer_more}
      </nav>
      <p class="drawer-tel">お電話 <a href="" data-tel data-track="tel_click" data-loc="drawer"></a><small>17:00から受付</small></p>
    </div>
  </div>
</header>
<nav class="pnav" aria-label="主要メニュー">
  <div class="wrap">
    {pnav}
  </div>
</nav>

<div class="season" id="season"></div>

<main{' id="top"' if is_home else ""}>
{crumbs_html}
{main}
</main>

<footer>
  <div class="wrap">
    <a class="logo" href="index.html"><img class="logo-mark" src="logo.svg" alt="ONE on ONE" width="150" height="30"><span>個室×肉ビストロ · 名古屋 栄</span></a>
    <nav aria-label="フッターナビゲーション">
      <a href="index.html">ホーム</a><a href="course.html">コース</a><a href="party.html">宴会・団体</a><a href="hire.html">貸切パーティー</a><a href="bonenkai.html">忘年会・新年会</a><a href="anniversary.html">誕生日・記念日</a><a href="afterparty.html">二次会</a><a href="space.html">お席・店内</a><a href="food.html">料理・ドリンク</a><a href="access.html">店舗情報・アクセス</a><a href="privacy.html">プライバシーポリシー</a>
    </nav>
    <p>ONE on ONE（ワンオンワン）／ 愛知県名古屋市中区錦3-10-21 プロシーム錦2F ／ TEL <span data-tel-text></span> ／ 地下鉄栄駅 徒歩5分<br>月〜土・祝前日 18:00〜翌5:00、日・祝 18:00〜翌3:00 ／ 20歳未満の方は禁煙席のみご案内しています。</p>
    <p>© ONE on ONE</p>
  </div>
</footer>

<div class="dock" aria-label="予約メニュー">
  <div class="row">
    {dock}
    <a href="" data-tel-link data-track="tel_click" data-loc="dock">電話</a>
  </div>
</div>

<div class="sheet" id="sheet" hidden role="dialog" aria-modal="true" aria-labelledby="sheet-title">
  <div class="sheet-in">
    <h3 id="sheet-title">予約サイトを選んでください</h3>
    <p class="note">どちらも空席確認・コース予約ができます（新しいタブで開きます）。受け付けられる人数は各サイトの表示をご確認ください。</p>
    <a class="btn solid" href="" data-book="hotpepper" target="_blank" rel="noopener" data-track="reserve_click" data-loc="sheet">ホットペッパーで予約</a>
    <a class="btn" href="" data-book="tabelog" target="_blank" rel="noopener" data-track="reserve_click" data-loc="sheet">食べログで予約</a>
    <p class="sheet-month" id="sheet-month" hidden>予約サイトの日付カレンダーで<b>12月</b>を選んでください。12月の金・土は早めに埋まります。満席の日は、お電話でご相談ください。</p>
    <p class="note sheet-tel">お電話でも承ります　<a href="" data-tel data-track="tel_click" data-loc="sheet"></a>（17:00〜）</p>
    <a class="textlink sheet-form" id="sheet-form" href="party.html#size" data-loc="sheet">40名以上の団体宴会・貸切のご案内</a>
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


ALL_PAGES = PAGES + course_pages()

if __name__ == "__main__":
    for p in ALL_PAGES:
        if p.get("main") or (SRC / f"{p['slug']}.main.html").exists():
            build(p)
