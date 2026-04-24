# API Gateway

基于 Next.js 的轻量 API 网关，通过单一入口 + method 参数路由到不同目标 API，部署在 Vercel。

## 使用方式

```
GET https://你的域名/api?method=user.getInfo&x-code=xxx
```

| 参数 | 必填 | 说明 |
|------|------|------|
| `method` | 是 | 路由方法名，对应 `config/routes.ts` 中的配置 |
| `x-code` | 否 | 认证参数，支持 query 传参或 header 传参 |
| 其他参数 | 否 | 自动透传到目标 API 的 query 中 |

## 请求示例

**curl:**

```bash
curl "https://你的域名/api?method=user.getInfo&x-code=your-code"
```

**Postman:**

- Method: `GET`
- URL: `https://你的域名/api?method=user.getInfo&x-code=your-code`

**POST 请求:**

```bash
curl -X POST "https://你的域名/api?method=order.create&x-code=your-code" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

## 添加路由

编辑 `config/routes.ts`：

```ts
const routes: Record<string, RouteConfig> = {
  "user.getInfo": {
    target: "https://api.example.com/user/info",
  },
  "order.list": {
    target: "https://api.example.com/order/list",
  },
  // 添加新路由
  "your.newMethod": {
    target: "https://your-api.com/endpoint",
    headers: { "X-Custom-Header": "value" },  // 可选：额外请求头
    params: { "defaultParam": "value" },       // 可选：默认 query 参数
  },
};
```

## 项目结构

```
api-gateway/
├── config/routes.ts      # 路由映射配置
├── lib/proxy.ts          # 请求转发核心逻辑
├── pages/api/index.ts    # 统一入口 API
├── pages/index.tsx       # 空首页
├── next.config.ts
└── package.json
```

## 本地开发

```bash
npm install
npm run dev
```

访问 `http://localhost:3000/api?method=user.getInfo&x-code=xxx`

## 部署到 Vercel

1. 在 [Vercel](https://vercel.com) 导入 Gitee/GitHub 仓库
2. Framework Preset 选择 **Next.js**
3. 点击 Deploy

## 分支说明

| 分支 | 用途 |
|------|------|
| `master` | 稳定发布版本 |
| `develop` | 日常开发分支 |
