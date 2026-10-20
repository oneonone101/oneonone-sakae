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

function calc() {
  const people = Math.max(0, parseInt(sPeople.value, 10) || 0);
  const room = document.querySelector("input[name=s-room]:checked").value === "yes";
  if (!sDate.value) { out.innerHTML = `<p class="k">RESULT</p><p>日付を選ぶと料金が表示されます。</p>`; renderTables(); return; }
  const [y, m, d] = sDate.value.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (H.closed({ m, d })) { renderTables(); out.innerHTML = `<p class="k">RESULT</p><p>12月31日〜1月4日は休業日です。別の日程をお選びください。</p>`; return; }
  const r = lookup(dt);
  renderTables(r);
  if (!r) { out.innerHTML = `<p class="k">RESULT</p><p>この日程の貸切は個別にご相談ください。</p><a class="btn" href="#reserve">相談フォームへ</a>`; return; }
  const base = room ? r.row.room : r.row.noRoom;
  const over = Math.max(0, people - r.row.cap);
  const extra = over * H.overPerPerson;
  const total = base + extra;
  const per = people ? Math.round(total / people) : 0;
  out.innerHTML = `
    <p class="k">ESTIMATE · ${m}月${d}日（${kindLabel[r.kind]}）</p>
    <p class="total">${fmt(total)}${r.row.from ? "〜" : ""}<small>最低保証</small></p>
    <dl>
      <div><dt>料金区分</dt><dd>${esc(r.period.label)}・${esc(r.row.days)}</dd></div>
      <div><dt>${room ? "完全貸切" : "フロア貸切"}（${esc(H.includes)}）</dt><dd>${fmt(base)}${r.row.from ? "〜" : ""}</dd></div>
      <div><dt>人数上限</dt><dd>${r.row.cap}名</dd></div>
      <div><dt>上限超過 ${over}名 × ¥5,000</dt><dd>${fmt(extra)}</dd></div>
      ${people ? `<div><dt>1名あたり（目安）</dt><dd>約${fmt(per)}</dd></div>` : ""}
      <div><dt>使える機材</dt><dd>${esc(H.types[room ? "room" : "noRoom"].equipment.join("・"))}</dd></div>
    </dl>
    ${people > 130 ? `<p class="warn">貸切でご案内できるのは立食130名までです。</p>` : people > 106 ? `<p class="warn">106名を超える場合は立食でのご案内になります。</p>` : ""}
    ${r.period.note ? `<p class="warn">${esc(r.period.note)}</p>` : ""}
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
  document.getElementById("f-msg").value = room ? "完全貸切（個室も含む）を希望します。" : "フロア貸切を希望します。";
});

/* courses */
document.getElementById("minicourses").innerHTML = SITE.courses
  .filter(c => !c.decOnly && c.id !== "anniversary")
  .map(c => `<div><b>${esc(c.ja)}${c.note ? `（${esc(c.note)}）` : ""}</b><span class="yen">${fmt(c.price)}</span>
    <small>全${c.items}品・飲み放題${esc(c.drink)}${decText(c) ? `／${esc(decText(c))}` : ""}</small></div>`).join("");
