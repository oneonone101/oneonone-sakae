# ONE on ONE 公式サイト（oneonone-sakae.jp）

名古屋・栄の個室×肉ビストロ「ONE on ONE」の公式サイト。静的HTML（`dist/`）＋フォーム送信API（`functions/api/inquiry.js`）を Cloudflare Pages で公開する構成。

## フォルダ構成

| パス | 内容 |
| --- | --- |
| `data.js` | **店舗情報・コース・料金・貸切料金表・祝日の唯一の置き場所**。内容変更はここだけ |
| `styles.css` / `common.js` | 全ページ共通のデザインと動き（予約ボタン、フォーム、GA4計測） |
| `src/*.main.html` / `src/*.js` / `src/*.head.html` | 各ページ（トップ含む）の本文・ページ用スクリプト・追加の head |
| `src/course-detail.*` | コース詳細ページのひな形。`data.js` のコースごとに `course-<id>.html` が自動でできる |
| `build.py` | 全ページを共通レイアウト（ヘッダー・主要メニュー・下部予約バー）で組み立てる。ページのタイトル・説明文もここ |
| `tools/site_json.js` | `data.js` を読み出す補助（コース詳細ページの生成に使用。Node.js が必要） |
| `tools/sync_faq.py` | 各ページのQ&Aから FAQ の構造化データ（`src/*.head.html`）を作り直す |
| `tools/prerender.py` | 本番用 `dist/` を作る（描画済みHTML化、プレビュー表示の除去、sitemap/robots） |
| `dist/` | **公開されるファイル**。直接編集しない |
| `functions/api/inquiry.js` | 団体・貸切フォームのメール送信（Resend）。Cloudflare Pages Functions |

## ページ構成と導線

主要メニュー（スマホはヘッダー直下に常に表示）：コース／宴会・貸切／お席／記念日／店舗情報。
画面下部：ネット予約／貸切相談（貸切ページへ。貸切ページ上では相談フォームへ）／電話。入力中とメニュー表示中は隠れる。

| ページ | 内容 |
| --- | --- |
| `index` | 店の特徴 → 目的別4カード（宴会・団体／大型貸切／誕生日・記念日／二次会）→ 人気コース → 席の写真 → 人数の目安 → アクセス → 予約。相談フォームは置かない |
| `course` | 食べログ型のコース一覧。カテゴリ（`data.js` の `courseCats`）と時期で絞り込み。`course.html#cat=anniversary` で指定可 |
| `course-<id>` | コース詳細（料金・料理・飲み放題・予約条件） |
| `party` | 宴会・団体（10〜20名／20〜40名／40名以上）。旧 `party#hire` などのリンクは `hire` へ自動で移動 |
| `hire` | 貸切：人数と種類 → 料金のしくみ → 料金表 → 座席配置 → 設備 → 試算 → Q&A → 相談フォーム |
| `afterparty` | 二次会 |

未確定の情報は `<span class="pv-only">…</span>` で書くとプレビューだけに表示され、公開版（`dist/`）からは削除される。

## 更新の流れ

1. `data.js`（または `src/` の本文）を編集。Q&Aを変えたら `python3 tools/sync_faq.py`
2. `python3 tools/prerender.py`（Playwright と Node.js が必要）
3. `dist/` を含めて GitHub に push → Cloudflare Pages が自動で公開

## Cloudflare Pages の設定

- ビルドコマンド：なし（空欄）
- ビルド出力ディレクトリ：`dist`
- ルートディレクトリ：空欄（リポジトリ直下。`functions/` を読み込むため）

## 環境変数（Cloudflare → Workers & Pages → プロジェクト → 設定 → 変数とシークレット）

| 名前 | 値 |
| --- | --- |
| `RESEND_API_KEY` | Resend の API キー（必須・「暗号化」で登録） |
| `STORE_EMAIL` | 通知の受信先（省略時 oneonone01010101@gmail.com） |
| `FROM_EMAIL` | Resend でドメイン認証後に `ONE on ONE <info@oneonone-sakae.jp>`。設定するとお客様に控えメールが届く |

`FROM_EMAIL` が未設定の間は Resend のテスト送信元を使うため、Resend アカウントは **oneonone01010101@gmail.com で作成**すること（テスト送信元はアカウント本人宛てにしか送れない）。

## 計測（GA4）

`tools/prerender.py` の `GA_ID` に測定ID を入れて再ビルドすると有効になる。送られるイベント：

| イベント | タイミング |
| --- | --- |
| `reserve_open` / `reserve_click` | ネット予約ボタン／予約サイトへの移動 |
| `tel_click` | 電話番号のタップ |
| `group_inquiry_click` / `group_inquiry_submit` | 団体・貸切相談への移動／フォーム送信完了 |
| `hire_price_click` | 貸切料金表への移動 |

## 季節の差し替え

`data.js` の `season`（バナー）と `holidays`（祝日、毎年更新）、`hire.periods`（貸切料金）を更新する。
