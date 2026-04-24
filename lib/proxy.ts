interface ProxyRequest {
  method: string;
  targetUrl: string;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

interface ProxyResponse {
  status: number;
  data: unknown;
  headers: Record<string, string>;
}

export async function proxyRequest(req: ProxyRequest): Promise<ProxyResponse> {
  const url = new URL(req.targetUrl);

  if (req.params) {
    Object.entries(req.params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...req.headers,
    },
  };

  if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  const response = await fetch(url.toString(), fetchOptions);

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  let data: unknown;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    data,
    headers: responseHeaders,
  };
}
