import type { NextApiRequest, NextApiResponse } from "next";
import routes from "@/config/routes";
import { proxyRequest } from "@/lib/proxy";

function extractString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-code");
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(204).end();
  }

  const method = extractString(req.query.method);
  const xCode =
    extractString(req.query["x-code"]) ||
    extractString(req.headers["x-code"] as string | string[] | undefined) ||
    "";

  if (!method) {
    return res.status(400).json({ error: "Missing required parameter: method" });
  }

  const route = routes[method];
  if (!route) {
    return res.status(404).json({
      error: `Unknown method: ${method}`,
      available: Object.keys(routes),
    });
  }

  const { target, headers = {}, params = {} } = route;
  const httpMethod = route.method || req.method || "GET";

  const forwardHeaders: Record<string, string> = { ...headers };
  if (xCode) {
    forwardHeaders["x-code"] = xCode;
  }

  let targetUrl = target;
  const forwardParams: Record<string, string> = { ...params };
  
  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "method" || key === "x-code") return;
    
    const strValue = typeof value === "string" ? value : Array.isArray(value) ? value.join(",") : "";
    
    // 如果 URL 中包含 {key}，则替换掉，且不加入 query string
    if (targetUrl.includes(`{${key}}`)) {
      targetUrl = targetUrl.replace(`{${key}}`, strValue);
    } else if (strValue) {
      forwardParams[key] = strValue;
    }
  });

  // 检查是否还有未替换的路径参数
  if (targetUrl.match(/\{[^}]+\}/)) {
    return res.status(400).json({ error: `Missing path parameters: ${targetUrl}` });
  }

  try {
    const result = await proxyRequest({
      method: httpMethod,
      targetUrl: targetUrl,
      headers: forwardHeaders,
      body: req.body,
      params: forwardParams,
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    const contentType = result.headers["content-type"] || "application/json";
    res.setHeader("Content-Type", contentType);
    return res.status(result.status).json(result.data);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return res.status(504).json({ error: "Upstream request timeout" });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(502).json({ error: "Upstream request failed", detail: message });
  }
}

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
};
