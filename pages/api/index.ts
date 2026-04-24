import type { NextApiRequest, NextApiResponse } from "next";
import routes from "@/config/routes";
import { proxyRequest } from "@/lib/proxy";

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

  const method = (req.query.method as string) || "";
  const xCode = (req.query["x-code"] as string) || (req.headers["x-code"] as string) || "";

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

  const forwardHeaders: Record<string, string> = { ...headers };
  if (xCode) {
    forwardHeaders["x-code"] = xCode;
  }

  const forwardParams: Record<string, string> = { ...params };
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== "method" && key !== "x-code" && typeof value === "string") {
      forwardParams[key] = value;
    }
  });

  try {
    const result = await proxyRequest({
      method: req.method || "GET",
      targetUrl: target,
      headers: forwardHeaders,
      body: req.body,
      params: forwardParams,
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    return res.status(result.status).json(result.data);
  } catch (error: unknown) {
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
