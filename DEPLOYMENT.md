# 客制化键盘制作系统部署说明

## 本地生产构建

```bash
pnpm install
pnpm build
pnpm start
```

如果使用 npm：

```bash
npm install
npm run build
npm start
```

生产服务默认监听 `http://localhost:3000`。当前项目的 Route Handlers 放在 `app/api/*/route.ts`，符合 Next.js App Router 的接口约定。

## 连接 Supabase

1. 在 Supabase 创建项目。
2. 打开 Supabase SQL Editor。
3. 执行 `supabase/schema.sql`。
4. 在项目根目录创建 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TAVILY_API_KEY=
FIRECRAWL_API_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` 只用于 Next.js 服务端 Route Handlers，不能暴露给浏览器。

## Vercel 部署

1. 把仓库推送到 GitHub、GitLab 或 Bitbucket。
2. 在 Vercel 新建项目并导入仓库。
3. Framework Preset 选择 Next.js。
4. 在 Project Settings -> Environment Variables 添加 `.env.example` 中列出的变量。
5. Deploy。

Vercel 会自动运行生产构建。静态资源目录已经按部署方式整理：

- 声音：`public/sounds`
- 3D 模型预留：`public/models`
- 图片预留：`public/images`

## 健康检查

部署后访问：

```text
https://your-domain.vercel.app/api/health
```

期望返回：

```json
{
  "status": "ok",
  "time": "2026-06-15T00:00:00.000Z",
  "database": "connected"
}
```

如果没有配置 Supabase，本地会返回 `database: "mock"`，表示当前使用本地 mock 存储。

## 官方参考

- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Supabase Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase service role server-side usage: https://supabase.com/docs/guides/troubleshooting/performing-administration-tasks-on-the-server-side-with-the-servicerole-secret-BYM4Fa
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Vercel Next.js deployment: https://vercel.com/docs/frameworks/full-stack/nextjs
