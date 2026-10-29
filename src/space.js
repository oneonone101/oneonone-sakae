const seatDetail = {
  "メインフロア": { desc: "ソファー席を中心に、人数に合わせてお席を組みます。貸切時は着席最大104名・立食最大130名。", use: "貸切パーティー、結婚式二次会、企業イベント" },
  "大理石ロングテーブル": { desc: "店内奥の、ゴールドに光る大理石のロングテーブル。20名掛けが2卓あり、カーテンで仕切ると半個室になります。", use: "歓送迎会、部署合同の宴会、同窓会" },
  "完全個室": { desc: "扉付きの個室です。8名と15名のお部屋があり、どちらもカラオケ付きです。2名様からご利用いただけます。", use: "接待、部署の宴会、二次会、誕生日のサプライズ", fee: "個室料金 ¥1,100／名（2時間ごと。コースの場合はコースの時間いっぱい）" },
  "半個室": { desc: "カーテンで仕切る半個室で、12名と16名のお部屋があります。ソファー席です。", use: "部署の宴会、歓送迎会、女子会、誕生日会" },
  "カップルシート（カウンター）": { desc: "大理石のバーカウンターにソファーチェアを並べたお席です。ふたり並んで座れます。", use: "デート、誕生日、記念日、食後の一杯" },
  "カップルシート": { desc: "重厚なソファーに並んで座る2名席。", use: "デート、誕生日、記念日" }
};
document.getElementById("seat-list").innerHTML = SITE.spaces.map((s, i) => {
  const d = seatDetail[s.name] || {};
  return `<article class="room">
    <div class="ph" data-photo="${esc(s.photoKey || "")}" role="img" aria-label="${esc(s.photo)}" style="--lx:${25 + i * 13}%;--ly:${18 + i * 9}%"></div>
    <div style="display:grid;gap:16px">
      <div class="head"><h2 style="font-size:24px">${esc(s.name)}</h2><span class="note">${esc(s.cap)}</span></div>
      <p class="lead">${esc(d.desc || "")}</p>
      <table class="spec">
        <tr><th scope="row">人数</th><td>${esc(s.cap)}</td></tr>
        <tr><th scope="row">向いている会</th><td>${esc(d.use || "")}</td></tr>
        ${d.fee ? `<tr><th scope="row">料金</th><td>${esc(d.fee)}</td></tr>` : ""}
      </table>
    </div>
  </article>`;
}).join("");
