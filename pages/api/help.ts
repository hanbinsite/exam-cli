import type { NextApiRequest, NextApiResponse } from "next";
import routes from "@/config/routes";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const methodList = Object.entries(routes).map(([key, config]) => ({
    method: key,
    target: config.target,
    httpMethod: config.method || "GET",
  }));

  res.status(200).json({
    service: "CLI API Gateway",
    baseUrl: "/api",
    auth: "x-code (query param or header)",
    usage: "/api?method=<route>&x-code=<code>&其他参数=值",
    note: "路径参数(如subject_id, question_id, material_id)通过query传入, 网关自动替换URL中的占位符",
    example: "/api?method=subjectDetail&subject_id=blockchain&x-code=A3K9X2",
    routes: methodList,
  });
}
