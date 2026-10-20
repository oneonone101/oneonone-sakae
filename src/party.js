const H = SITE.hire;
const fmt = n => "¥" + n.toLocaleString("ja-JP");
const pad = n => String(n).padStart(2, "0");
const iso = dt => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
const isHoliday = dt => SITE.holidays.includes(iso(dt));

function dayKind(dt) {
  const next = new Date(dt); next.setDate(dt.getDate() + 1);
  const w = dt.getDay();
  if (w === 5 || w === 6 || isHoliday(next)) return "peak";
  if (w === 0) return "sun"; // 祝日（金土・祝前を除く）は平日料金
  return "weekday";
}
function lookup(dt) {
  const key = { m: dt.getMonth() + 1, d: dt.getDate() };
  const period = H.periods.find(p => p.match(key));
  if (!period) return null;
  const kind = dayKind(dt);
  return { period, row: period.rows.find(r => r.kinds.includes(kind)), kind };
}

/* 人数別カード・料金の表示 */
renderBanquet(document.getElementById("banquet"), { loc: "party", hireHref: "#hire", formHref: "#reserve" });
(() => {
  const P = banquetPrices();
  const dec = SITE.season.priceFocus === "dec";
  const range = dec
    ? `12月：飲み放題付きコース ¥${yen(P.dec)}〜（1名・税込・飲み放題${P.decDrink}〜）<small>1〜11月は ¥${yen(P.normal)}〜（${P.normalNote || "通常料金"}）</small>`
    : `飲み放題付きコース ¥${yen(P.normal)}〜（1名・税込）<small>12月は ¥${yen(P.dec)}〜</small>`;
  document.querySelectorAll("[data-bind=courseRange]").forEach(n => n.innerHTML = range);
  document.querySelectorAll("[data-bind=partyFrom]").forEach(n => n.textContent = "¥" + yen(dec ? P.dec : P.normal) + "〜");
  document.querySelectorAll("[data-bind=partyFromLabel]").forEach(n => n.textContent = dec ? "12月の宴会コース（1名）" : "宴会コース（1名）");
})();

/* min fee for summary */
const allFees = H.periods.flatMap(p => p.rows.map(r => r.noRoom));
document.querySelectorAll("[data-min-fee]").forEach(n => n.textContent = Math.min(...allFees).toLocaleString("ja-JP"));

/* tables */
function renderTables(hit) {
  document.getElementById("ptables").innerHTML = H.periods.map(p => `
    <div class="ptable">
      <h3>${esc(p.label)}${p.note ? `<small>${esc(p.note)}</small>` : ""}</h3>
      <div class="scroll"><table>
        <thead><tr><th scope="col">曜日</th><th scope="col">フロア貸切</th><th scope="col">完全貸切</th><th scope="col">上限</th></tr></thead>
        <tbody>${p.rows.map(r => `<tr class="${hit && hit.period === p && hit.row === r ? "hit" : ""}"><th scope="row">${esc(r.days)}</th>
          <td>${fmt(r.noRoom)}${r.from ? "〜" : ""}</td><td>${fmt(r.room)}${r.from ? "〜" : ""}</td><td>${r.cap}名</td></tr>`).join("")}</tbody>
      </table></div>
    </div>`).join("");
}

/* simulator */
const sDate = document.getElementById("s-date"), sPeople = document.getElementById("s-people"), out = document.getElementById("sim-out");
const kindLabel = { peak: "金・土・祝前日", sun: "日曜", weekday: "月〜木・祝日" };
function nextFriday() { const d = new Date(); d.setDate(d.getDate() + 30); while (d.getDay() !== 5) d.setDate(d.getDate() + 1); return d; }
sDate.value = iso(nextFriday());
sDate.min = iso(new Date());

let simTracked = false;
const HOLIDAY_YEARS = new Set(SITE.holidays.map(h => h.slice(0, 4)));
function calc(ev) {
  if (ev && !simTracked) { simTracked = true; track("hire_simulator_use", {}); }
  const raw = sPeople.value.trim();
  const people = Math.max(0, Math.floor(Number(raw)) || 0);
  const room = document.querySelector("input[name=s-room]:checked").value === "yes";
  if (!sDate.value) { out.innerHTML = `<p class="k">RESULT</p><p>日付を選ぶと料金が表示されます。</p>`; renderTables(); return; }
  const [y, m, d] = sDate.value.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (dt < today) { renderTables(); out.innerHTML = `<p class="k">RESULT</p><p>過去の日付です。今日以降の日付を選んでください。</p>`; return; }
  if (H.closed({ m, d })) { renderTables(); out.innerHTML = `<p class="k">RESULT</p><p>12月31日〜1月4日は休業日です。別の日程をお選びください。</p>`; return; }
  const r = lookup(dt);
  renderTables(r);
  if (!r) { out.innerHTML = `<p class="k">RESULT</p><p>この日程の貸切は個別にご相談ください。</p><a class="btn" href="#reserve">相談フォームへ</a>`; return; }
  const base = room ? r.row.room : r.row.noRoom;
  const from = r.row.from ? "〜" : "";
  const nextDay = new Date(dt); nextDay.setDate(dt.getDate() + 1);
  const dayTags = ["日月火水木金土"[dt.getDay()], isHoliday(dt) ? "祝" : "", isHoliday(nextDay) ? "祝前日" : ""].filter(Boolean).join("・");
  const head = `<p class="k">ESTIMATE · ${m}月${d}日（${dayTags}）· ${esc(r.row.days)}の料金</p>`;
  if (people > 130) {
    out.innerHTML = `${head}<p class="total" style="font-size:28px">ご相談ください</p>
      <p class="warn">貸切でご案内できるのは立食130名までです。130名を超える場合は、相談フォームかお電話でご相談ください。</p>
      <a class="btn solid" href="#reserve" data-track="group_inquiry_click" data-loc="simulator">相談する</a>`;
    return;
  }
  const over = Math.max(0, people - r.row.cap);
  const extra = over * H.overPerPerson;
  const total = base + extra;
  const per = people ? Math.round(total / people) : 0;
  const P = banquetPrices();
  const smallTip = people && people <= 40
    ? `<p class="tip">${people}名なら、貸切にしなくても<a href="#size">個室・大理石テーブルの宴会</a>でご案内できます（飲み放題付きコース ${dt.getMonth() === 11 ? "12月" : ""}¥${yen(dt.getMonth() === 11 ? P.dec : P.normal)}〜／1名）。</p>` : "";
  out.innerHTML = `${head}
    <p class="total">${fmt(total)}${from}<small>最低保証・税込</small></p>
    <dl>
      <div><dt>料金区分</dt><dd>${esc(r.period.label)}・${esc(r.row.days)}</dd></div>
      <div><dt>${room ? "完全貸切" : "フロア貸切"}（${esc(H.includes)}）</dt><dd>${fmt(base)}${from}</dd></div>
      <div><dt>人数上限</dt><dd>${r.row.cap}名</dd></div>
      <div><dt>上限を超える人数</dt><dd>${over ? `${over}名 × ${fmt(H.overPerPerson)} ＝ ${fmt(extra)}` : "なし"}</dd></div>
      ${people ? `<div><dt>1名あたり（目安）</dt><dd>約${fmt(per)}${from}</dd></div>` : ""}
      <div><dt>使える機材</dt><dd>${esc(H.types[room ? "room" : "noRoom"].equipment.join("・"))}</dd></div>
    </dl>
    ${people > 106 ? `<p class="warn">106名を超える場合は立食でのご案内になります。</p>` : ""}
    ${r.period.note ? `<p class="warn">${esc(r.period.note)}</p>` : ""}
    ${!HOLIDAY_YEARS.has(String(y)) ? `<p class="warn">${y}年の祝日はまだ反映していません。祝日・祝前日の料金はご相談時にご確認ください。</p>` : ""}
    ${smallTip}
    <a class="btn solid" href="#reserve" data-track="group_inquiry_click" data-loc="simulator">この条件で相談する</a>`;
  out.dataset.date = sDate.value;
}
[sDate, sPeople].forEach(el => el.addEventListener("input", calc));
document.querySelectorAll("input[name=s-room]").forEach(el => el.addEventListener("change", calc));
calc();

/* carry simulator values into the form */
out.addEventListener("click", e => {
  if (!e.target.closest("[data-loc=simulator]")) return;
  document.getElementById("f-date").value = sDate.value;
  document.getElementById("f-people").value = sPeople.value;
  document.getElementById("f-purpose").value = "貸切パーティー";
  const room = document.querySelector("input[name=s-room]:checked").value === "yes";
  const msg = document.getElementById("f-msg");
  const line = room ? "完全貸切（個室も含む）を希望します。" : "フロア貸切を希望します。";
  if (!msg.value.includes("貸切（")) msg.value = msg.value ? line + "\n" + msg.value : line;
});

/* courses（宴会向け。表示する時期は SITE.season.priceFocus に合わせる） */
(() => {
  const period = SITE.season.priceFocus === "dec" ? "dec" : "normal";
  const list = coursesFor(period).filter(c => !c.decOnly && c.id !== "anniversary");
  const off = period === "dec" ? SITE.courses.filter(c => !c.dec && !c.decOnly).map(c => `<div class="off"><b>${esc(c.ja)}</b><span class="yen">—</span><small>12月は販売なし</small></div>`).join("") : "";
  document.getElementById("minicourses").innerHTML = (period === "dec" ? `<p class="pk-dec" style="justify-self:start">12月の料金</p>` : "") + list.map(c => `<div><b>${esc(c.ja)}${c.note ? `（${esc(c.note)}）` : ""}</b><span class="yen">${fmt(c.price)}</span>
    <small>全${c.items}品・飲み放題${esc(c.drink)}${period === "dec" && c.normalPrice ? `／1〜11月は${fmt(c.normalPrice)}・${esc(c.normalDrink)}` : (decText(c) ? `／${esc(decText(c))}` : "")}</small></div>`).join("") + off;
})();
