# クイズポータル

小中学生向けの学習クイズアプリ。スマホで遊べて、ログインすると進み具合やランキングが保存される。

**公開URL:** https://math-quiz-beige-iota.vercel.app/

## 遊べるクイズ

| クイズ | 対象 | パス |
|---|---|---|
| 沖縄マップクイズ | 沖縄本島の市町村 | `/map` |
| 算数クイズ | 小学6年生 | `/math` |
| 理科クイズ | 中学1年生 | `/science` |
| 数学クイズ | 中学1年生 | `/math1` |

## 主な機能

- **通常モード**: ランダムに出題される練習問題
- **合宿モード**: 苦手な問題を集中して復習
- **カテゴリ別チャレンジ**: カテゴリごとに制覇を目指す
- **卒業テスト**: 全カテゴリ制覇後に挑戦できる総まとめテスト
- **ランキング / 卒業生一覧**: 連続正解の記録と卒業テスト合格者を表示
- **ログイン**: ユーザー名とパスワードで進み具合を保存（全クイズ共通アカウント）

## 使っている技術

- [Next.js](https://nextjs.org/) 16（App Router）/ React 19 / TypeScript
- Tailwind CSS 4
- [Upstash Redis](https://upstash.com/)（ユーザー情報・進み具合・ランキングの保存）
- bcryptjs（パスワードのハッシュ化）
- Vercel（デプロイ）

## ローカルで動かす

```bash
npm install
```

プロジェクト直下に `.env.local` を作り、Upstash Redis の接続情報を書く（Vercel の Upstash 連携で発行される名前でもOK）。

```
KV_REST_API_URL=https://xxxx.upstash.io
KV_REST_API_TOKEN=xxxx
```

開発サーバーを起動して http://localhost:3000 を開く。

```bash
npm run dev
```

> 本番データを壊さないよう、ローカルでは本番とは別の Redis データベースを使うのがおすすめ。

## フォルダ構成

```
src/
├── app/                 # ページとAPI（Next.js App Router）
│   ├── page.tsx         # トップ（クイズ選択）
│   ├── map/             # 沖縄マップクイズ
│   ├── math/ math1/ science/  # 各教科のクイズ
│   ├── ranking/ graduates/    # ランキング・卒業生一覧
│   └── api/             # ログイン・進み具合・成績のAPI
├── components/          # 画面部品（QuizApp は全教科共通のクイズ画面）
├── context/             # ログイン状態の管理
└── lib/
    ├── subjects/        # 教科ごとの設定（タイトル・カテゴリ・問題数など）
    ├── *QuestionBank.*  # 問題データ
    └── redis.ts         # Redis の接続とキー定義
```

新しい教科を追加するときは、`src/lib/subjects/` に設定ファイルを足し、`src/app/` にページを作る。

## デプロイ

`main` ブランチに push すると Vercel が自動でデプロイする。環境変数（Redis の接続情報）は Vercel のプロジェクト設定で管理している。
