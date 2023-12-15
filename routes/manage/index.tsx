import { FreshApp } from "../_middleware.ts";

export function handler(_: Request, __: FreshApp) {
  const headers = new Headers();
  headers.set("location", "/collections");
  return new Response(null, {
    status: 303,
    headers,
  });
}
