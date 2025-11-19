# TODOアプリ

Next.jsで作成したシンプルなTODOアプリです。

## 技術スタック
- **フロントエンド**: Next.js 15 (App Router) - ポート 3001
- **バックエンド**: Next.js 15 (API Routes のみ) - ポート 4000
- **データベース**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS
- **開発環境**: Docker / Node.js

## アーキテクチャ

このプロジェクトは、フロントエンドとバックエンドを完全に分離した構成になっています：

```
todo-app/
├── frontend/              # フロントエンド (Next.js UI)
│   ├── app/
│   │   ├── page.js       # メインページ
│   │   ├── layout.js     # レイアウト
│   │   └── globals.css   # グローバルスタイル
│   ├── package.json      # フロントエンド専用の依存関係
│   ├── next.config.js    # Next.js設定
│   └── Dockerfile        # フロントエンドのDocker設定
│
├── backend/              # バックエンド (API専用)
│   ├── app/api/todos/    # API Routes
│   │   ├── route.js      # GET/POST /api/todos
│   │   ├── [id]/route.js # PATCH/DELETE /api/todos/[id]
│   │   └── storage.js    # Supabaseデータベース操作
│   ├── lib/cors.js       # CORS設定
│   ├── package.json      # バックエンド専用の依存関係
│   └── Dockerfile        # バックエンドのDocker設定
│
├── compose.yml           # Docker Compose設定
├── README.md             # プロジェクトドキュメント
└── .gitignore            # Git除外設定
```

### 通信フロー
1. フロントエンド (port 3001) → バックエンド (port 4000)
2. バックエンド → Supabase (PostgreSQL)
3. CORS設定により、クロスオリジンリクエストが許可されています

## 機能
- ✅ タスクの追加
- ✅ タスクの編集
- ✅ タスクの削除
- ✅ タスクの完了/未完了の切り替え
- ✅ タスク一覧表示
- ✅ タスクにタグを追加
- ✅ タグでフィルタリング
- ✅ タグごとにグルーピング表示
- ✅ 日付でソート
- ✅ 完了済みタスクの表示/非表示
- ✅ レスポンシブデザイン

## セットアップ

### 1. 依存関係のインストール

フロントエンドとバックエンドの両方に依存関係をインストールします：

```bash
# フロントエンドの依存関係
cd frontend
npm install
cd ..

# バックエンドの依存関係
cd backend
npm install
cd ..
```

### 2. Supabaseプロジェクトの設定

#### 2.1 Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com/)にアクセス
2. 新しいプロジェクトを作成

#### 2.2 データベーステーブルの作成
Supabase ダッシュボードの SQL Editor で以下のSQLを実行：

```sql
-- TODOテーブルを作成
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 作成日時でソートするためのインデックス
CREATE INDEX idx_todos_created_at ON todos ("createdAt" DESC);

-- タグでフィルタリングするためのGINインデックス
CREATE INDEX idx_todos_tags ON todos USING GIN (tags);

-- RLSを無効化（開発用）
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
```

#### 2.3 環境変数の設定

フロントエンドとバックエンドで異なる環境変数が必要です：

**フロントエンド** (`frontend/.env.local`)：
```bash
cp frontend/.env.local.example frontend/.env.local
```

`frontend/.env.local`の内容：
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**バックエンド** (`backend/.env`)：
```bash
cp backend/.env.local.example backend/.env
```

Supabaseダッシュボードの Settings > API から情報を取得し、`backend/.env`に設定：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
```

### 3. アプリケーションの起動

#### Dockerを使用する場合

Docker Composeで両方のサービスを同時に起動：

```bash
docker compose up --build
```

#### npm/nodeを直接使用する場合

2つのターミナルウィンドウで、それぞれバックエンドとフロントエンドを起動：

**ターミナル1 - バックエンド:**
```bash
cd backend
npm run dev
# バックエンドAPI: http://localhost:4000
```

**ターミナル2 - フロントエンド:**
```bash
cd frontend
npm run dev
# フロントエンド: http://localhost:3001
```

アプリケーションは http://localhost:3001 でアクセスできます。

## API仕様

バックエンドAPIは http://localhost:4000 で動作します。

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | /api/todos | TODO一覧取得 |
| POST | /api/todos | TODO追加 |
| PATCH | /api/todos/[id] | TODO更新 |
| DELETE | /api/todos/[id] | TODO削除 |

### CORS設定
バックエンドはCORSヘッダーを返すよう設定されています：
- 許可オリジン: `http://localhost:3001`, `http://localhost:3000`
- 許可メソッド: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`
- 許可ヘッダー: `Content-Type`, `Authorization`

## データ構造

### データベーススキーマ（Supabase/PostgreSQL）
```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### JSONレスポンス
```javascript
{
  id: string,         // UUID
  title: string,
  completed: boolean,
  tags: string[],     // タグの配列
  createdAt: string   // ISO 8601 (TIMESTAMPTZ)
}
```

## 開発の経緯

### Phase 1: インメモリ実装（完了）
- 基本的なCRUD機能の実装
- インメモリストレージでの動作確認
- UI/UXの構築と改善

### Phase 2: Supabase連携（完了）
- ✅ Supabaseデータベース接続
- ✅ 永続的なデータ保存
- ✅ PostgreSQL配列型を使ったタグ機能

### Phase 3: フロントエンド/バックエンド分離（完了）
- ✅ バックエンドAPI専用プロジェクトの作成
- ✅ フロントエンドとバックエンドの完全分離
- ✅ CORS設定の実装
- ✅ Docker Compose対応
- ✅ 独立したデプロイが可能な構成

## デプロイ

フロントエンドとバックエンドは別々にデプロイする必要があります。

### Vercelへのデプロイ

#### バックエンドのデプロイ
1. `backend/`ディレクトリを新しいVercelプロジェクトとしてデプロイ
```bash
cd backend
vercel
```

2. 環境変数の設定（Vercelダッシュボード）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ALLOWED_ORIGINS` (例: `https://your-frontend.vercel.app`)

3. デプロイURLを控える（例: `https://your-backend.vercel.app`）

#### フロントエンドのデプロイ
1. ルートディレクトリを新しいVercelプロジェクトとしてデプロイ
```bash
vercel
```

2. 環境変数の設定（Vercelダッシュボード）：
   - `NEXT_PUBLIC_API_URL` (バックエンドのURL、例: `https://your-backend.vercel.app`)

3. 本番デプロイ
```bash
vercel --prod
```

**注意:** デプロイ後、バックエンドの`ALLOWED_ORIGINS`にフロントエンドのURLを追加することを忘れないでください。

## 注意事項
- 本番環境では、SupabaseのRow Level Security (RLS)を有効にすることを推奨します
- 現在は開発用にRLSを無効化していますが、本番運用時はセキュリティポリシーを設定してください
