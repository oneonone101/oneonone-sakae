/* =========================================================
   SITE DATA — 店舗情報・コース・料金はこのファイルだけを書き換える
   verified:false の項目は「要確認」として表示される
   本番(Next.js)では content/site.ts に移す
   ========================================================= */
const SITE = {
  tel: "052-957-6646",
  /* 写真（photos/ フォルダ）。差し替えはファイルを置き換えるだけ。w,h は実寸 */
  photos: {
    "floor": { src: "photos/floor.jpg", w: 1206, h: 791, alt: "シャンデリアと吊り下げのグリーンが彩るONE on ONEの店内全体。テーブル席と奥に光る大理石のテーブル" },
    "marble": { src: "photos/marble.jpg", w: 1206, h: 1503, alt: "クリスタルのペンダントライトの下に伸びる、光る大理石のロングテーブル" },
    "marble-day": { src: "photos/marble-day.jpg", w: 1134, h: 846, alt: "窓際に伸びる大理石のロングテーブル。宴会用にセットした様子" },
    "semi-chandelier": { src: "photos/semi-chandelier.jpg", w: 1134, h: 846, alt: "シャンデリアと木の壁に囲まれた半個室" },
    "semi-green": { src: "photos/semi-green.jpg", w: 1134, h: 846, alt: "壁一面のグリーンとランタンの照明がある半個室のソファー席" },
    "salmon": { src: "photos/salmon.jpg", w: 1200, h: 801, alt: "サーモンのレアカツ。断面はレアで、いくらを散らしたソースを添えて" },
    "burrata": { src: "photos/burrata.jpg", w: 800, h: 1200, alt: "旬果のブラータカプレーゼ。さくらんぼと生ハム、バジルを添えて" },
    "meat": { src: "photos/meat.jpg", w: 1200, h: 799, alt: "黒い皿に盛った牛肉のグリル、ローストビーフ、鶏肉のコンフィなどの肉料理" },
    "ajillo": { src: "photos/ajillo.jpg", w: 1200, h: 801, alt: "スキレットで出す牡蠣やきのこ、タコのアヒージョとムール貝、フライドポテト" },
    "pizza": { src: "photos/pizza.jpg", w: 1200, h: 799, alt: "トマトソースとチーズ、バジルをのせた焼きたてのピザを取り分ける様子" },
    "room-large": { src: "photos/room-large.jpg", w: 984, h: 1200, alt: "モザイクタイルとレンガの壁に囲まれた15名の完全個室。黒い大理石のテーブル" },
    "room-small": { src: "photos/room-small.jpg", w: 985, h: 1200, alt: "シャンデリアと大理石のテーブルがある8名の完全個室。壁にはモニター" },
    "counter": { src: "photos/counter.jpg", w: 973, h: 1200, alt: "光る大理石のバーカウンターと、革張りのソファーチェア" },
    "plate": { src: "photos/plate.jpg", w: 1003, h: 1200, alt: "Happy Birthdayの文字を描いたデザートプレート。ケーキと飾り切りのフルーツ" },
    "tableart": { src: "photos/tableart.jpg", w: 1200, h: 1187, alt: "大理石のテーブルいっぱいに描いたHappy Birthdayのテーブルアート。花とフルーツ、ケーキ" },
    "kadaif": { src: "photos/kadaif.jpg", w: 800, h: 1200, alt: "天使のエビのカダイフ揚げ。レモンとハーブを添えて" }
  },
  booking: {
    hotpepper: "https://www.hotpepper.jp/strJ000726902/yoyaku/",
    tabelog: "https://tabelog.com/aichi/A2301/A230103/23052790/"
  },
  season: { // 時期に合わせて差し替え（忘年会 → 新年会 → 歓送迎会）
    active: true,
    en: "Year-end Party 2026",
    text: "忘年会のご予約受付中。12月の宴会コースは飲み放題付き¥5,000〜",
    link: "bonenkai.html",
    /* 宴会の料金をどちらで先に見せるか。"dec"＝12月料金を主に表示（10〜12月）、"normal"＝通常料金（1月〜） */
    priceFocus: "dec"
  },
  /* 人数別の宴会案内（トップ・宴会ページ・忘年会ページ共通）。料金はコースと貸切料金表から自動で計算
     kind: course＝飲み放題付きコース（ネット予約が主）／talk＝飲み放題付きコース（相談が主）／hire＝貸切（最低保証料金制）
     note: カード下部の小さな補足 */
  banquet: [
    { id: "b10", range: "10〜20", unit: "名", title: "個室・大理石テーブルでの宴会", chip: "個室・大理石テーブル",
      seats: ["完全個室：8名・15名（個室料金 1名¥1,100）", "半個室：12名・16名", "大理石テーブル：20名×2卓"],
      photoKey: "room-large", kind: "course", cta: "空席を確認・予約" },
    { id: "b20", range: "20〜40", unit: "名", title: "会社宴会・部署合同の集まり", chip: "半個室",
      seats: ["20名掛けの大理石テーブル×2卓", "カーテンで仕切って半個室に", "30名前後の宴会にも"],
      photoKey: "marble", kind: "talk", cta: "宴会を相談する" },
    { id: "b40", range: "40", unit: "名以上", title: "大人数の会社宴会・団体利用", chip: "大型宴会も対応",
      seats: ["同じフロア内に複数のテーブルをご用意", "大人数の会社宴会や忘年会にも対応しています"],
      note: "※人数・席配置・空席状況によりご案内が異なります。",
      photoKey: "floor", kind: "talk", cta: "団体宴会を相談する" },
    { id: "bhire", range: "貸切", unit: "", title: "会社イベント・大型パーティー", chip: "フロア・店舗貸切",
      seats: ["着席106席・立食最大130名", "他のお客様を気にせずイベントを開催", "マイク・プロジェクター（完全貸切は音響も）", "180分制（受付30分・コース2時間・撤退30分）"],
      photoKey: "marble-day", kind: "hire", cta: "貸切料金を確認" }
  ],
  hours: [
    { day: "月〜土・祝前日", time: "18:00 — 翌5:00", note: "料理L.O. 翌4:00 ／ ドリンクL.O. 翌4:30", verified: true },
    { day: "日・祝日", time: "18:00 — 翌3:00", note: "料理L.O. 翌2:00 ／ ドリンクL.O. 翌2:30", verified: true },
    { day: "定休日", time: "なし", note: "12月31日〜1月4日は休業", verified: true }
  ],
  hoursShort: "18:00 — 翌5:00（日祝は翌3:00）",
  tiers: [
    { size: "2", unit: "名", title: "カップルシート", photo: "大理石カウンターのカップルシート", photoKey: "counter", items: ["光る大理石カウンターのソファーチェア", "ふたり並んで座れる席", "誕生日・記念日・デートに"], cta: "カップルシートを予約", book: true, verified: true },
    { size: "8·15", unit: "名", title: "完全個室", photo: "個室（扉付き）", photoKey: "room-small", items: ["8名様・15名様の扉付き個室", "部署の宴会・接待・女子会に", "個室料金あり（下記参照）"], cta: "個室を予約", book: true, verified: true },
    { size: "〜40", unit: "名", title: "半個室・大理石テーブル", photo: "大理石ロングテーブル", photoKey: "marble", items: ["20名掛けの大理石テーブル×2", "カーテンで仕切って半個室に", "歓送迎会・団体宴会に"], cta: "宴会を予約", book: true, verified: true },
    { size: "130", unit: "名まで", title: "貸切パーティー", photo: "貸切パーティー", photoKey: "floor", items: ["着席106席・立食130名まで", "最低保証料金制（月・曜日で変動）", "マイク・プロジェクター利用可"], cta: "貸切料金を見る", href: "party.html#hire", book: false, verified: true }
  ],
  /* dec: 12月の内容（null = 12月の販売は要確認）／ decOnly: 12月だけ表示 */
  courses: [
    { id: "standard", en: "Standard", ja: "STANDARDコース", note: "日〜木限定", price: 4000, was: 5000, items: 7, drink: "120分", menu: "牛ハラミのグリル、おすすめパスタ ほか", people: "3〜99名", time: "18:00〜翌3:00", dec: null, decNote: "12月は販売なし", verified: true },
    { id: "recommended", en: "Recommended", ja: "おすすめコース", price: 4500, was: 5500, items: 9, drink: "120分", menu: "季節のピザ、牛すじのトマトパスタ、牛ハラミの肉料理 ほか", people: "2〜99名", time: "18:00〜翌3:00", dec: { price: 5000, drink: "120分" }, verified: true },
    { id: "gradeup", en: "Grade Up", ja: "GRADEUPコース", price: 5000, was: 6000, items: 10, drink: "150分", menu: "自家製ローストビーフ、牛リブロースのグリル、シェフのおすすめパスタ ほか", people: "2〜99名", time: "18:00〜翌3:00", dec: { price: 6000, drink: "120分" }, featured: true, badge: "POPULAR", verified: true },
    { id: "premium", en: "Premium", ja: "PREMIUMコース", price: 6000, was: 7000, items: 10, drink: "180分", menu: "黒毛和牛イチボのグリル、生ウニのクリームパスタ ほか", people: "2〜99名", time: "18:00〜翌1:00", dec: { price: 7000, drink: "150分" }, verified: true },
    { id: "anniversary", en: "Anniversary", ja: "ANNIVERSARYコース", price: 7000, was: null, items: 12, drink: "150分", menu: "テーブルアートの前菜、自家製ローストビーフ、和牛イチボのグリル、季節のピザ、メッセージ付きデザートプレート ほか", people: "2〜99名", time: "18:00〜翌3:00", dec: { price: 7000, drink: "150分" }, verified: true },
    { id: "afterparty", en: "After Party", ja: "二次会コース", note: "22:00〜", price: 3300, was: null, items: 4, drink: "120分", menu: "二次会向けの軽めの料理", people: "2〜99名", time: "22:00〜翌1:00", dec: { price: 3300, drink: "120分" }, verified: true },
    { id: "xmas", en: "Christmas", ja: "X'masコース", note: "12月限定", decOnly: true, price: 11000, was: null, items: 10, drink: "なし", menu: "和牛タン、旬の寒ブリ ほか", people: "2〜10名", time: "17:30〜翌3:00", verified: true }
  ],
  /* 料理メニュー（食べログ掲載の店舗メニューより。価格は税込）。note: "おすすめ" など */
  menu: [
    { cat: "New Dishes", ja: "新メニュー", items: [
      { name: "自家製タルタルのサーモンレアカツ", price: 2880, note: "おすすめ" },
      { name: "旬果のブラータカプレーゼ", price: 2400, note: "おすすめ" },
      { name: "鮮魚のカルパッチョ", price: 1980, note: "おすすめ" }
    ] },
    { cat: "Appetizer", ja: "前菜", items: [
      { name: "マスカルポーネとトマトの生ハム包み", price: 980 },
      { name: "ノルウェーサーモンのムース", price: 980 },
      { name: "前菜盛り合わせ", price: 1980 },
      { name: "チーズ盛り合わせ", price: 1780 },
      { name: "イタリアンプロシュートの盛り合わせ", price: 1380 },
      { name: "自家製ローストビーフ", price: 1580 },
      { name: "オリーブ盛り合わせ", price: 680 },
      { name: "エビとアボカドのレモンマリネ", price: 1080 },
      { name: "しらすとトマトのブルスケッタ", price: 980 },
      { name: "フルーツトマトのカプレーゼ", price: 1080 },
      { name: "ノルウェースモークサーモンのカルパッチョ", price: 1080 },
      { name: "厳選野菜の自家製ピクルス", price: 980 },
      { name: "タコとドライトマトのマリネ", price: 1180 },
      { name: "ホタテ貝柱のタルタル", price: 1180 },
      { name: "地鶏ささみのマリネ", price: 980 },
      { name: "トリュフ香るホワイトマッシュルームスライス", price: 1180 }
    ] },
    { cat: "Salad", ja: "サラダ", items: [
      { name: "自家製ドレッシングのシーザーサラダ", price: 1080 },
      { name: "エビとアボカドのチョップサラダ", price: 1380 },
      { name: "トマトとナッツの生ハムサラダ", price: 1380 },
      { name: "厳選野菜のバーニャカウダ", price: 1680 }
    ] },
    { cat: "Warm Dishes", ja: "温菜", items: [
      { name: "カキとマッシュルームのアヒージョ", price: 1480 },
      { name: "ベーコンとキノコのアヒージョ", price: 1280 },
      { name: "タコとブロッコリーのアヒージョ", price: 1480 },
      { name: "天使のエビと季節野菜のソテー", price: 1580 },
      { name: "牛肉の赤ワイン煮込み", price: 1280 },
      { name: "ソーセージ5種盛り合わせ", price: 1180 },
      { name: "マッシュルームのパンチェッタ詰め", price: 1180 },
      { name: "ムール貝の白ワイン蒸し", price: 1080 },
      { name: "サーモンとキノコのグラタン仕立て", price: 1180 },
      { name: "インカのめざめのフライドポテト〜トリュフの香り〜", price: 1380 },
      { name: "フレンチポテト", price: 880 },
      { name: "ガーリックアンチョビポテト", price: 980 },
      { name: "ガーリックバケット", price: 780 },
      { name: "バケット", price: 680 }
    ] },
    { cat: "Pizza", ja: "ピザ", items: [
      { name: "マルゲリータ", price: 1580 },
      { name: "自家製ミートソース", price: 1680 },
      { name: "クワトロフォルマッジ", price: 1680 },
      { name: "しらすと大葉のピザ", price: 1680 }
    ] },
    { cat: "Risotto", ja: "リゾット", items: [
      { name: "生ウニのクリームリゾット", price: 1680 },
      { name: "カキとキノコのクリームリゾット", price: 1680 },
      { name: "ゴルゴンゾーラのチーズリゾット", price: 1580 },
      { name: "ポルチーニとトリュフのクリームリゾット", price: 1880 }
    ] },
    { cat: "Pasta", ja: "パスタ", items: [
      { name: "生ウニのクリームソース", price: 1880 },
      { name: "とびこと大葉のペペロンチーノ", price: 1680 },
      { name: "ズワイガニのトマトクリームソース", price: 1680 },
      { name: "エビとキノコのペペロンチーノ", price: 1580 },
      { name: "ポルチーニとトリュフのクリームソース", price: 1980 },
      { name: "トリュフ香るカルボナーラ", price: 1980 },
      { name: "ベーコンとナスのトマトソース", price: 1580 },
      { name: "自家製ボロネーゼ", price: 1680 },
      { name: "ランプとバジルのラグーソース", price: 1580 },
      { name: "アラビアータ", price: 1580 }
    ] },
    { cat: "Meat", ja: "肉料理", items: [
      { name: "黒毛和牛イチボのグリル", price: 4280 },
      { name: "特選牛リブロースステーキ", price: 2880 },
      { name: "特選牛ハラミのグリル", price: 2980 },
      { name: "特選牛フィレのグリル", price: 3980 },
      { name: "特選牛ランプのステーキ", price: 3980 },
      { name: "豚肩ロースのグリル", price: 2280 },
      { name: "鶏モモ肉のコンフィ", price: 1880 }
    ] },
    { cat: "Dessert", ja: "デザート", items: [
      { name: "イチゴのプロフィットロール・オ・ショコラ", price: 1180 },
      { name: "レアチーズケーキ", price: 980 },
      { name: "ガトーショコラ", price: 980 },
      { name: "ミルクティーのアイス", price: 780 },
      { name: "ハニーナッツのバニラアイス", price: 680 },
      { name: "メッセージ付きデザートプレート", price: 2200, note: "誕生日・記念日に" }
    ] }
  ],
  /* ドリンク（食べログ掲載メニューより。価格表示は2022年の掲載時点） */
  drinks: [
    { name: "ONE on ONE オリジナルカクテル", price: "¥1,100〜", desc: "苺とパイナップルのカクテル、ライチとヨーグルトのマティーニ、夜の紅茶、マンゴーマティーニ、抹茶ホッパーなど。" },
    { name: "フレッシュフルーツのカクテル", price: "¥1,100〜", desc: "完熟パイナップルのモヒート、苺とラズベリーのフローズンカクテル、白桃フローズンカクテル、豆乳とGODIVAのカクテルなど。" },
    { name: "ワイン", price: "グラス ¥900〜／ボトル ¥5,000〜", desc: "スペイン、イタリア、アルゼンチン、ニュージーランドなど。オーパスワンまで揃えています。" },
    { name: "シャンパン", price: "ボトル ¥8,800〜", desc: "GH マム、ヴーヴ・クリコ、モエ・エ・シャンドン、ベル・エポック、アルマン ド ブリニャックなど。" },
    { name: "ウイスキー・焼酎", price: "¥900〜", desc: "バーボン、スコッチ、山崎・白州・響などのジャパニーズウイスキー。焼酎は魔王、佐藤、伊佐美など。" },
    { name: "ビール・カクテル・ソフトドリンク", price: "¥600〜", desc: "ギネス、ヒューガルデン、コロナなどの瓶ビール、定番カクテル、ノンアルコールのドリンク。" }
  ],
  spaces: [
    { name: "メインフロア", cap: "着席106席・立食130名", photo: "ヴィンテージモダンのメインフロア", photoKey: "floor", verified: true },
    { name: "大理石ロングテーブル", cap: "20名×2卓", photo: "ゴールドの大理石テーブル", photoKey: "marble-day", verified: true },
    { name: "半個室", cap: "12名・16名", photo: "グリーンの壁の半個室", photoKey: "semi-green", verified: true },
    { name: "完全個室", cap: "8名・15名", photo: "扉付き個室", photoKey: "room-large", verified: true },
    { name: "カップルシート（カウンター）", cap: "7席", photo: "光る大理石のバーカウンター", photoKey: "counter", verified: true }
  ],
  dishes: [
    { name: "自家製タルタルのサーモンレアカツ", desc: "衣はさっくり、中はとろりとしたレアの仕上がり。自家製のタルタルソースで。", price: 2880, photoKey: "salmon" },
    { name: "天使のエビのカダイフ揚げ", desc: "極細の生地カダイフをまとわせて揚げた一品。", price: null, photoKey: "kadaif" },
    { name: "旬果のブラータカプレーゼ", desc: "季節のフルーツとブラータチーズを合わせた前菜。", price: 2400, photoKey: "burrata" },
    { name: "特選牛のグリル", desc: "黒毛和牛イチボ、リブロース、ハラミ、フィレ、ランプから選べます。", price: 2880, from: true, photoKey: "meat" },
    { name: "アヒージョ", desc: "カキとマッシュルーム、ベーコンとキノコ、タコとブロッコリーの3種類。", price: 1280, from: true, photoKey: "ajillo" },
    { name: "ピザ・パスタ", desc: "マルゲリータやクワトロフォルマッジ、生ウニのクリームソース、トリュフ香るカルボナーラなど。", price: 1580, from: true, photoKey: "pizza" }
  ],
  info: [
    { k: "店名", v: "ONE on ONE（ワンオンワン）", s: "個室×肉ビストロ" },
    { k: "住所", v: "愛知県名古屋市中区錦3-10-21 プロシーム錦2F" },
    { k: "定休日", v: "なし", s: "12月31日〜1月4日は休業" },
    { k: "アクセス", v: "地下鉄「栄駅」徒歩5分", s: "久屋大通駅・伏見駅からも徒歩圏" },
    { k: "電話", v: "052-957-6646", s: "17:00から受付" },
    { k: "座席数", v: "106席（立食130名）", s: "完全個室 8名・15名" },
    { k: "お支払い", v: "現金・クレジットカード（VISA / Master / AMEX）", s: "電子マネー・QRコード決済は不可" },
    { k: "喫煙", v: "分煙", s: "20歳未満の方は禁煙席のみ" },
    { k: "キャンセル", v: "コース予約の当日キャンセル・減員は、キャンセル料がかかります" }
  ],
  charges: [
    { name: "テーブルチャージ", yen: "550円", note: "アラカルト利用時のみ。コース利用時はかかりません。", verified: true },
    { name: "深夜チャージ", yen: "1,100円", note: "24:00以降のご入店はテーブルチャージが1,100円になります。", verified: true },
    { name: "個室料金（完全個室）", yen: "1,100円/名", note: "2時間ごとに1名1,100円。コースの場合はコースの時間いっぱいご利用いただけます。", verified: true }
  ],
  tableArt: { price: 3850, deadline: "前日まで" },
  plate: { price: 2200, note: "当日のお電話でも可・アラカルト利用でも可" },

  /* ---------- 貸切 最低保証料金（2025年料金表＋5万円） ----------
     rows の kind: sun=日曜 / weekday=月〜木・祝日 / peak=金・土・祝前日
     room: 個室も含めて貸切 / noRoom: 個室を除いて貸切
     from:true は「〜」付きの下限表示 */
  hire: {
    overPerPerson: 5000,
    includes: "コース料理・飲み放題込み",
    tax: "税込",
    closed: d => (d.m === 12 && d.d === 31) || (d.m === 1 && d.d <= 4),
    types: {
      noRoom: { name: "フロア貸切", sub: "個室を除く", equipment: ["マイク", "プロジェクター（音声なし）"] },
      room: { name: "完全貸切", sub: "個室も含む", equipment: ["マイク", "プロジェクター", "音響"] }
    },
    cancel: { whole: "1か月前まで", reduce: "前日まで", verified: false }, // 段階的なキャンセル料は検討中
    timeline: [
      { label: "受付", time: "30分" },
      { label: "コース", time: "2時間（L.O.）" },
      { label: "完全撤退", time: "30分" }
    ],
    periods: [
      { id: "jan", label: "1月・2月", match: d => [1, 2].includes(d.m),
        rows: [
          { kinds: ["sun"], days: "日", noRoom: 250000, room: 300000, cap: 50 },
          { kinds: ["weekday"], days: "月〜木・祝日", noRoom: 300000, room: 350000, cap: 50 },
          { kinds: ["peak"], days: "金・土・祝前", noRoom: 450000, room: 500000, cap: 80 }
        ] },
      { id: "spring", label: "3月・4月・11月", match: d => [3, 4, 11].includes(d.m),
        rows: [
          { kinds: ["sun"], days: "日", noRoom: 300000, room: 350000, cap: 50 },
          { kinds: ["weekday"], days: "月〜木・祝日", noRoom: 350000, room: 400000, cap: 60 },
          { kinds: ["peak"], days: "金・土・祝前", noRoom: 550000, room: 600000, cap: 90 }
        ] },
      { id: "summer", label: "5月〜10月", match: d => d.m >= 5 && d.m <= 10,
        rows: [
          { kinds: ["sun", "weekday"], days: "日〜木・祝日", noRoom: 300000, room: 350000, cap: 50 },
          { kinds: ["peak"], days: "金・土・祝前", noRoom: 500000, room: 550000, cap: 80 }
        ] },
      { id: "dec", label: "12月1日〜22日", note: "可能であれば1か月前までに全額お支払い", match: d => d.m === 12 && d.d <= 22,
        rows: [
          { kinds: ["sun"], days: "日", noRoom: 350000, room: 400000, cap: 60 },
          { kinds: ["weekday"], days: "月〜木・祝日", noRoom: 550000, room: 650000, cap: 90 },
          { kinds: ["peak"], days: "金・土・祝前", noRoom: 750000, room: 750000, from: true, cap: 90 }
        ] },
      { id: "xmas", label: "12月23日〜25日", match: d => d.m === 12 && d.d >= 23 && d.d <= 25,
        rows: [{ kinds: ["sun", "weekday", "peak"], days: "全日", noRoom: 1050000, room: 1050000, from: true, cap: 100 }] },
      { id: "yearend", label: "12月26日〜30日", match: d => d.m === 12 && d.d >= 26 && d.d <= 30,
        rows: [{ kinds: ["sun", "weekday", "peak"], days: "全日", noRoom: 750000, room: 750000, from: true, cap: 70 }] }
    ]
  },

  /* 祝日（毎年更新） */
  holidays: ["2026-11-03","2026-11-23","2027-01-01","2027-01-11","2027-02-11","2027-02-23","2027-03-22","2027-04-29","2027-05-03","2027-05-04","2027-05-05","2027-07-19","2027-08-11","2027-09-20","2027-09-23","2027-10-11","2027-11-03","2027-11-23"]
};
