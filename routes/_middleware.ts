import { FreshContext } from "$fresh/server.ts";
import { getLogger } from "$logging/index.ts";
import { AppContext } from "../app.context.ts";
import {
  createSignedCookie,
  verifySignedCookie,
} from "https://deno.land/x/squishy_cookies@1.2.0/mod.ts";
import { deleteCookie, getCookies, setCookie } from "$std/http/cookie.ts";
import { decodeBase64, encodeBase64 } from "$std/encoding/base64.ts";
import Carbon from "../libs/carbon.ts";
import { base64Decode } from "https://deno.land/x/mysql@v2.12.1/deps.ts";
import { AllowGuest } from "../libs/constants.ts";

export interface State {
  context: AppContext;
  query: Map<string, string>;
  jsonQuery: Record<string, string>;
  chain: Record<string, string>;
  user: User | null;
}

export type FreshApp = FreshContext<State>;

export const handler = [
  appContextSetup,
  CORS,
  getChainHeaders,
  injectChainHeaders,
  setAuthCookie,
  parseAuth,
  parseQuery,
  getLogger({
    includeDuration: true,
  }),
];

//// AUTH
const AUTH_COOKIE_KEY = "X-SESSION";
async function parseAuth(req: Request, ctx: FreshApp) {
  let __user = await verifySignedCookie(
    req.headers,
    AUTH_COOKIE_KEY,
    Deno.env.get("COOKIES_SECRET")!,
  );
  const uri = new URL(req.url);
  if (
    !__user && !AllowGuest.includes(uri.pathname) &&
    ctx.destination === "route"
  ) {
    return new Response(null, {
      status: 307,
      headers: {
        location: "/login",
      },
    });
  }

  if (__user) {
    __user = __user.split(".").length > 1 ? __user.split(".")[0] : __user;
    try {
      ctx.state.user = <User> JSON.parse(
        new TextDecoder().decode(decodeBase64(__user)) || "{}",
      );
    } catch (error) {
      console.error(error);
      __user = false;
    }
  }
  const resp = await ctx.next();
  if (!__user) {
    console.log(__user, "DELETING ...........");
    deleteCookie(resp.headers, AUTH_COOKIE_KEY);
  }
  if (ctx.state.user) {
    if (uri.pathname == "/login" && ctx.destination == "route") {
      return new Response(null, {
        status: 303,
        headers: {
          location: "/",
        },
      });
    }
  }
  return resp;
}

async function setAuthCookie(_: Request, ctx: FreshApp) {
  const resp = await ctx.next();
  if (ctx.state.user) {
    const b64 = encodeBase64(JSON.stringify(ctx.state.user));
    const { cookie } = await createSignedCookie(
      AUTH_COOKIE_KEY,
      b64,
      Deno.env.get("COOKIES_SECRET")!,
    );
    resp.headers.append("set-cookie", cookie);
  }

  return resp;
}
/////

///// CHAINED
const X_CHAINED = "X-CHAINED";
const X_CHAINED_PREFIX = "x-chained-";
async function injectChainHeaders(req: Request, ctx: FreshApp) {
  ctx.state.chain = ctx.state.chain || {};
  if (ctx.destination === "route") {
    const cookie = getCookies(req.headers);
    const xChained = cookie[X_CHAINED];

    if (xChained) {
      const _value = new TextDecoder().decode(base64Decode(xChained));
      for (const value of _value.split(",")) {
        const [k, v] = value.split("=");
        if (k && v) {
          ctx.state.chain[k.replace(X_CHAINED_PREFIX, "").toLowerCase()] = v;
        }
      }
    }
  }
  const resp = await ctx.next();
  return resp;
}

async function getChainHeaders(_: Request, ctx: FreshApp) {
  const resp = await ctx.next();
  if (ctx.destination === "route") {
    const keys = [...resp.headers.keys()].filter((k) =>
      k.startsWith(X_CHAINED_PREFIX)
    );
    let chain: string[] = [];
    for (const key of keys) {
      chain = chain.concat(`${key.toLowerCase()}=${resp.headers.get(key)!}`);
    }

    if (chain.length > 0) {
      setCookie(resp.headers, {
        name: X_CHAINED,
        value: encodeBase64(chain.join(",")),
        expires: Carbon.carbon().addSecond(5),
      });
    }
  }
  return resp;
}
/////

async function parseQuery(req: Request, ctx: FreshApp) {
  const m = new Map<string, string>();
  const js: Record<string, string> = {};
  if (ctx.destination === "route") {
    const u = new URL(req.url);
    for (const [k, v] of u.searchParams.entries()) {
      if (v) {
        m.set(k, v);
        js[k] = v;
      }
    }
  }
  ctx.state.query = m;
  ctx.state.jsonQuery = js;
  const resp = await ctx.next();
  return resp;
}

async function appContextSetup(
  _: Request,
  ctx: FreshContext<State>,
) {
  ctx.state.context = AppContext.instance();
  ctx.state.chain = ctx.state.chain || {};
  const resp = await ctx.next();
  return resp;
}

async function CORS(req: Request, ctx: FreshContext) {
  const origin = req.headers.get("Origin") || "*";
  const resp = await ctx.next();
  const headers = resp.headers;

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
  );
  headers.set(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS, GET, PUT, DELETE",
  );
  return resp;
}
