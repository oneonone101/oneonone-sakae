const P = banquetPrices();
const DEC = SITE.season.priceFocus === "dec";
const C = id => SITE.courses.find(c => c.id === id);

/* ファーストビューの料金 */
$("#hero-price").innerHTML = DEC
  ? `<span>飲み放題付き宴会コース</span><b>¥${yen(P.dec)}〜</b><small>12月・1名税込</small>`
  : `<span>飲み放題付き宴会コース</span><b>¥${yen(P.normal)}〜</b><small>1名税込${P.normalNote ? "・" + esc(P.normalNote) : ""}</small>`;

/* 目的から選ぶ：4つのカード（料金はコース・貸切料金表から計算） */
const ap = C("afterparty"), an = C("anniversary");
const scenes = [
  { href: "party.html", photo: "marble", k: "Party", title: "宴会・団体", desc: "10名〜40名以上。個室・半個室・大理石テーブル",
    price: `<span>飲み放題付きコース${DEC ? "（12月）" : ""}</span><b>¥${yen(DEC ? P.dec : P.normal)}〜</b><small>／名</small>` },
  { href: "hire.html", photo: "marble-day", k: "Private Hire", title: "大型貸切", desc: "着席最大104名・立食最大130名",
    price: `<span>会場全体の最低保証料金${DEC ? "（12月）" : ""}</span><b>¥${yen(DEC ? P.hireDec : P.hireAll)}〜</b>` },
  { href: "anniversary.html", photo: "plate", k: "Anniversary", title: "誕生日・記念日", desc: "メッセージプレート・テーブルアート",
    price: `<span>デザートプレート</span><b>¥${yen(SITE.plate.price)}</b><small>／コース¥${yen(an.price)}</small>` },
  { href: "afterparty.html", photo: "counter", k: "After Party", title: "二次会", desc: "22時から。カラオケ付き個室も",
    price: `<span>二次会コース</span><b>¥${yen(ap.price)}</b><small>／名</small>` }
];
$("#scene-cards").innerHTML = scenes.map(s => `
  <a class="scene" href="${s.href}" data-track="scene_click" data-loc="home-${s.href.replace(".html", "")}">
    <div class="ph" data-photo="${s.photo}"></div>
    <div class="scene-body">
      <span class="k">${s.k}</span>
      <h3>${s.title}</h3>
      <p class="scene-desc">${s.desc}</p>
      <p class="scene-price">${s.price}</p>
    </div>
  </a>`).join("");

/* 人気コース */
const HOME_COURSES = ["gradeup", "recommended", "premium", "standard"];
bindPeriodToggle("hperiod", period => {
  const list = coursesFor(period).filter(c => HOME_COURSES.includes(c.id)).sort((a, b) => HOME_COURSES.indexOf(a.id) - HOME_COURSES.indexOf(b.id)).slice(0, 3);
  $("#courses").innerHTML = list.map(c => courseListCard(c, { loc: "home-course" })).join("");
  fillPhotos(); cleanLinks($("#courses"));
});
$("#cat-links").innerHTML = SITE.courseCats.map(k => `<a href="course.html#cat=${k.id}">${esc(k.label)}</a>`).join("");
$("#photo-note").textContent = SITE.coursePhotoNote;

/* お席の写真 */
$("#spaces").innerHTML = SITE.spaces.map(s => `
  <figure${s.verified === false ? " data-unverified" : ""}>
    <div class="ph" data-photo="${esc(s.photoKey || "")}" role="img" aria-label="${esc(s.photo)}"></div>
    <figcaption><b>${esc(s.name)}</b><span>${esc(s.cap)}${chk(s, "人数 要確認")}</span></figcaption>
  </figure>`).join("");

/* 料理 */
$("#dishes").innerHTML = SITE.dishes.slice(0, 3).map(d => `
  <article class="dish">
    <div class="ph" data-photo="${esc(d.photoKey || "")}" role="img" aria-label="${esc(d.name)}"></div>
    <h3>${esc(d.name)}</h3>
  </article>`).join("");

/* 営業時間・店舗情報 */
$("#hours").innerHTML = SITE.hours.map(h => `<tr${h.verified === false ? " data-unverified" : ""}><th scope="row">${esc(h.day)}</th><td>${esc(h.time)}${chk(h)}<small>${esc(h.note)}</small></td></tr>`).join("");
$("#info").innerHTML = SITE.info.filter(r => ["住所", "アクセス", "電話", "お支払い"].includes(r.k)).map(r => `<tr${r.verified === false ? " data-unverified" : ""}><th scope="row">${esc(r.k)}</th><td>${esc(r.v)}${chk(r)}${r.s ? `<small>${esc(r.s)}</small>` : ""}</td></tr>`).join("");
