# TODOアプリ

Next.jsで作成したシンプルなTODOアプリです。

## 技術スタック
- **フロントエンド**: Next.js 15 (App Router)
- **API**: Vercel Functions (プレーンJavaScript)
- **データベース**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS
- **開発環境**: Docker
- **ポート**: 3001

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
```bash
npm install
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
1. `.env.local.example`をコピーして`.env.local`と`.env`を作成：
```bash
cp .env.local.example .env.local
cp .env.local.example .env
```

2. Supabaseダッシュボードの Settings > API から以下の情報を取得し、`.env.local`と`.env`の両方に設定：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**注意:**
- `.env.local`: npm/nodeで直接起動する場合に使用
- `.env`: Dockerで起動する場合に使用（docker-composeが自動的に読み込みます）

### 3. アプリケーションの起動

#### Dockerを使用する場合
```bash
docker-compose up --build
```

#### npm/nodeを直接使用する場合
```bash
npm run dev
```

アプリは http://localhost:3001 で起動します。

### API仕様

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | /api/todos | TODO一覧取得 |
| POST | /api/todos | TODO追加 |
| PATCH | /api/todos/[id] | TODO更新 |
| DELETE | /api/todos/[id] | TODO削除 |

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

## Vercelへのデプロイ

プロジェクトはVercelにデプロイ可能な構成になっています。

### デプロイ手順
1. Vercelプロジェクトの作成
```bash
vercel
```

2. 環境変数の設定
Vercelダッシュボードの Settings > Environment Variables で以下を設定：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. 再デプロイ
```bash
vercel --prod
```

## 注意事項
- 本番環境では、SupabaseのRow Level Security (RLS)を有効にすることを推奨します
- 現在は開発用にRLSを無効化していますが、本番運用時はセキュリティポリシーを設定してください
