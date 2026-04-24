interface ProxyRequest {
  method: string;
  targetUrl: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  timeout?: number;
}

interface ProxyResponse {
  status: number;
  data: unknown;
  headers: Record<string, string>;
}

const DEFAULT_TIMEOUT = 30000;

export async function proxyRequest(req: ProxyRequest): Promise<ProxyResponse> {
  const url = new URL(req.targetUrl);

  if (req.params) {
    Object.entries(req.params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), req.timeout || DEFAULT_TIMEOUT);

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...req.headers,
    },
    signal: controller.signal,
  };

  if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data: unknown;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else if (
      contentType.includes("text/") ||
      contentType.includes("xml") ||
      contentType.includes("urlencoded")
    ) {
      data = await response.text();
    } else {
      const buffer = await response.arrayBuffer();
      data = Buffer.from(buffer).toString("base64");
    }

    return {
      status: response.status,
      data,
      headers: responseHeaders,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
