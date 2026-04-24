import type { GetServerSideProps } from "next";
import routes from "@/config/routes";

export default function Home() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      service: "API Gateway",
      usage: "/api?method=<route>&x-code=<code>",
      available: Object.keys(routes),
    })
  );
  return { props: {} };
};
