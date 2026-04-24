export interface RouteConfig {
  target: string;
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

const routes: Record<string, RouteConfig> = {
  "user.getInfo": {
    target: "https://api.example.com/user/info",
  },
  "order.list": {
    target: "https://api.example.com/order/list",
  },
};

export default routes;
