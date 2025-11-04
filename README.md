# TODOアプリ

Next.jsで作成したシンプルなTODOアプリです。

## Phase 1: インメモリ実装（完了）

### 技術スタック
- **フロントエンド**: Next.js 15 (App Router)
- **API**: Vercel Functions (プレーンJavaScript)
- **スタイリング**: Tailwind CSS
- **開発環境**: Docker
- **ポート**: 3001

### 機能
- ✅ タスクの追加
- ✅ タスクの編集
- ✅ タスクの削除
- ✅ タスク一覧表示
- ✅ レスポンシブデザイン

### ローカル環境での起動

#### Dockerを使用する場合
```bash
docker-compose up --build
```

#### npm/nodeを直接使用する場合
```bash
npm install
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

### データ構造
```javascript
{
  id: string,        // UUID
  title: string,
  completed: boolean,
  createdAt: string  // ISO 8601
}
```

### 現在の制限事項
- データはインメモリに保存されるため、サーバー再起動時にリセットされます
- これはPhase 1の仕様であり、Phase 2でSupabaseに接続予定です

## Phase 2: Supabase連携（予定）
- データベース接続
- 永続的なデータ保存
- 環境変数による切り替え

## Vercelへのデプロイ準備
プロジェクトはVercelにデプロイ可能な構成になっています。

```bash
# Vercel CLIでデプロイ
vercel
```
