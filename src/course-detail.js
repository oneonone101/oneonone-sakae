const c = SITE.courses.find(x => x.id === "{ID}");
const DECF = SITE.season.priceFocus === "dec";
const fmtY = n => "¥" + yen(n);
const drinkTxt = d => d === "なし" ? "なし" : d;
/* 見出しの料金：12月を主に見せる時期は12月料金、それ以外は通常料金 */
const showDec = c.decOnly || (DECF && c.dec);
const price = showDec && !c.decOnly ? c.dec.price : c.price;
const drink = showDec && !c.decOnly ? c.dec.drink : c.drink;

document.getElementById("cd-photo").dataset.photo = c.photoKey || "";
document.getElementById("cd-photo-note").textContent = SITE.coursePhotoNote;
document.getElementById("cd-tags").innerHTML = [c.badge ? `<span class="t-hot">人気</span>` : "", `<span>${esc(catLabel(c.cat))}</span>`, c.note ? `<span class="t-note">${esc(c.note)}</span>` : ""].join("");
document.getElementById("cd-name").innerHTML = `${esc(c.ja)}<small class="cd-en">${esc(c.en)} Course</small>`;
document.getElementById("cd-price").innerHTML = `${showDec && !c.decOnly ? `<span class="pk-dec">12月料金</span>` : ""}<strong>${fmtY(price)}</strong><span>税込／1名</span>${!showDec && c.was ? `<s>通常 ${fmtY(c.was)}</s>` : ""}`
  + (DECF && !c.dec && !c.decOnly ? `<p class="cd-warn">${esc(c.decNote || "12月は販売なし")}（上記は1〜11月の料金です）</p>` : "");
document.getElementById("cd-spec").innerHTML = `
  <div><dt>料理</dt><dd>${c.items}<small>品</small></dd></div>
  <div><dt>飲み放題</dt><dd>${esc(drinkTxt(drink))}</dd></div>
  <div><dt>人数</dt><dd>${esc(c.people)}</dd></div>`;

/* 料金（時期別） */
const rows = [];
if (!c.decOnly) rows.push(`<tr><th scope="row">1〜11月</th><td><b>${fmtY(c.price)}</b>${c.was ? `<small>通常 ${fmtY(c.was)}</small>` : ""}</td><td>${esc(drinkTxt(c.drink))}</td></tr>`);
if (c.dec) rows.push(`<tr><th scope="row">12月</th><td><b>${fmtY(c.dec.price)}</b></td><td>${esc(drinkTxt(c.dec.drink))}</td></tr>`);
else if (c.decOnly) rows.push(`<tr><th scope="row">12月限定</th><td><b>${fmtY(c.price)}</b></td><td>${esc(drinkTxt(c.drink))}</td></tr>`);
else rows.push(`<tr class="off"><th scope="row">12月</th><td colspan="2">${esc(c.decNote || "販売なし")}</td></tr>`);
document.getElementById("cd-price-table").innerHTML = `<thead><tr><th scope="col">時期</th><th scope="col">料金（税込・1名）</th><th scope="col">飲み放題</th></tr></thead><tbody>${rows.join("")}</tbody>`;
document.getElementById("cd-price-note").textContent = `${c.was ? "表示価格はグルメサイト掲載時点の割引後価格で、時期により変わります。" : "表示価格はグルメサイト掲載時点の内容で、時期により変わります。"}コース利用時はテーブルチャージがかかりません。`;

/* 料理（掲載は主な料理） */
const dishes = c.menu.split("、").map(s => s.replace(/\s*ほか$/, "").trim()).filter(Boolean);
const hasMore = /ほか$/.test(c.menu.trim());
document.getElementById("cd-menu").innerHTML = dishes.map(d => `<li>${esc(d)}</li>`).join("") + (hasMore ? `<li class="more">ほか（全${c.items}品）</li>` : "");
document.getElementById("cd-menu-note").textContent = `${hasMore ? `主な料理を掲載しています（全${c.items}品）。` : `全${c.items}品。`}仕入れにより内容が変わる場合があります。`;

/* 飲み放題 */
const decDrinkDiff = c.dec && c.dec.drink !== c.drink;
document.getElementById("cd-drink").innerHTML = c.drink === "なし"
  ? `<p class="cd-big">飲み放題は付いていません</p><p class="note">ドリンクは別途ご注文ください。<a href="food.html#drink-title">ドリンクメニュー</a></p>`
  : `<p class="cd-big">${esc(c.drink)}${decDrinkDiff ? `<small>（12月は${esc(c.dec.drink)}）</small>` : ""}</p><p>${esc(SITE.drinkFlow)}が付いています。</p><p class="note"><a href="food.html#drink-title">ドリンクメニューを見る</a></p>`;

/* ご予約の条件（確定している内容のみ） */
const charge = n => SITE.charges.find(x => x.name.startsWith(n));
const tc = charge("テーブルチャージ"), room = charge("個室料金");
const cancel = SITE.info.find(r => r.k === "キャンセル"), pay = SITE.info.find(r => r.k === "お支払い");
const period = c.decOnly ? "12月のみ" : c.dec ? "通年（12月は料金・飲み放題の時間が変わる場合があります）" : `1〜11月（${c.decNote || "12月は販売なし"}）`;
const cond = [
  ["人数", `${c.people}<small>ネット予約で受け付けている人数です。大人数は<a href="party.html">宴会・団体のご案内</a>をご覧ください。</small>`],
  ["ご入店時間", esc(c.time)],
  c.note ? ["ご利用条件", esc(c.note)] : null,
  ["販売時期", esc(period)],
  tc && tc.verified !== false ? ["チャージ", "テーブルチャージはかかりません"] : null,
  room && room.verified !== false ? ["個室料金", `完全個室をご利用の場合 ${esc(room.yen)}<small>コースの時間いっぱいご利用いただけます。</small>`] : null,
  cancel && cancel.verified !== false ? ["キャンセル", esc(cancel.v)] : null,
  pay ? ["お支払い", `${esc(pay.v)}<small>${esc(pay.s || "")}</small>`] : null
].filter(Boolean);
document.getElementById("cd-cond").innerHTML = cond.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join("");
const extra = {
  anniversary: `<p class="cd-link"><a href="anniversary.html">誕生日・記念日の演出（テーブルアート・メッセージプレート）を見る</a></p>`,
  afterparty: `<p class="cd-link"><a href="afterparty.html">二次会のご案内（カラオケ付き個室・営業時間）を見る</a></p>`,
  xmas: `<p class="cd-link"><a href="bonenkai.html">12月のご予約について（忘年会のご案内）</a></p>`
}[c.id] || `<p class="cd-link"><a href="party.html">10名以上の宴会のご案内（人数別の席）を見る</a></p>`;
document.getElementById("cd-extra").innerHTML = extra;
if (c.decOnly) window.BOOK_MONTH = 12;

/* ほかのコース */
const per = (DECF ? "dec" : "normal");
let rel = coursesFor(per).filter(x => x.id !== c.id);
rel = [...rel.filter(x => x.cat === c.cat), ...rel.filter(x => x.cat !== c.cat)].slice(0, 3);
document.getElementById("cd-related").innerHTML = rel.map(x => courseListCard(x, { loc: "course-related" })).join("");
fillPhotos();
