import type { NextApiRequest, NextApiResponse } from "next";
import routes from "@/config/routes";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    service: "API Gateway",
    usage: "/api?method=<route>&x-code=<code>",
    available: Object.keys(routes),
  });
}
