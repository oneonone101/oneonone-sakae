# ONE on ONE 公式サイト（oneonone-sakae.jp）

名古屋・栄の個室×肉ビストロ「ONE on ONE」の公式サイト。静的HTML（`dist/`）＋フォーム送信API（`api/inquiry.js`）を Vercel で公開する構成。

## フォルダ構成

| パス | 内容 |
| --- | --- |
| `data.js` | **店舗情報・コース・料金・貸切料金表・祝日の唯一の置き場所**。内容変更はここだけ |
| `styles.css` / `common.js` | 全ページ共通のデザインと動き（予約ボタン、フォーム、GA4計測） |
| `index.html` | トップページ |
| `src/*.main.html` / `src/*.js` | 下層ページの本文とページ用スクリプト |
| `build.py` | 下層ページを共通レイアウトで組み立てる（ページのタイトル・説明文もここ） |
| `tools/prerender.py` | 本番用 `dist/` を作る（描画済みHTML化、プレビュー表示の除去、sitemap/robots） |
| `dist/` | **公開されるファイル**。直接編集しない |
| `api/inquiry.js` | 団体・貸切フォームのメール送信（Resend） |

## 更新の流れ

1. `data.js`（または `src/` の本文）を編集
2. `python3 tools/prerender.py`（Playwright が必要）
3. `dist/` を含めて GitHub に push → Vercel が自動で公開

## 環境変数（Vercel → Settings → Environment Variables）

| 名前 | 値 |
| --- | --- |
| `RESEND_API_KEY` | Resend の API キー（必須） |
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
