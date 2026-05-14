import type { NextApiRequest, NextApiResponse } from "next";
import { proxyRequest } from "@/lib/proxy";

const TARGET = "https://exam-server.hanbin123.com/api/v1/cli/materials/{id}";

function extractString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function formatAsText(data: { title: string; content: string }): string {
  return `# ${data.title}\n\n${data.content}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-code");
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(204).end();
  }

  const id = extractString(req.query.id);
  const xCode =
    extractString(req.query["x-code"]) ||
    extractString(req.headers["x-code"] as string | string[] | undefined) ||
    "";

  if (!xCode) {
    return res.status(401).json({ code: 401, data: null, message: "x-code required" });
  }

  if (!id) {
    return res.status(400).json({ code: 400, data: null, message: "Missing material id" });
  }

  const targetUrl = TARGET.replace("{id}", id);

  const forwardParams: Record<string, string> = {};
  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "x-code" || key === "id") return;
    if (value) {
      forwardParams[key] = typeof value === "string" ? value : Array.isArray(value) ? value.join(",") : "";
    }
  });

  try {
    const result = await proxyRequest({
      method: "GET",
      targetUrl,
      headers: { "x-code": xCode },
      params: forwardParams,
    });

    const responseData = result.data as { code: number; data: { title: string; content: string } };
    const text = formatAsText(responseData.data);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(text);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return res.status(504).json({ error: "Upstream request timeout" });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(502).json({ error: "Upstream request failed", detail: message });
  }
}
