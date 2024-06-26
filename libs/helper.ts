import { FreshApp } from "../routes/_middleware.ts";
import { CDN } from "./constants.ts";

export function getSchema(ctx: FreshApp, m: string) {
  const schemas = ctx.state.context.schema();
  return schemas.get(m.toLowerCase());
}

export function getConfig(ctx: FreshApp, m: string) {
  const config = ctx.state.context.config();
  return config.get(m.toLowerCase());
}

export function getCollections(ctx: FreshApp) {
  return [...(ctx.state.context.schema()).keys()];
}

export function assets(s?: string | null) {
  return CDN + s;
}

// deno-lint-ignore no-explicit-any
export function getKeys<T extends { [_: string | number | symbol]: any }>(_: T): Array<keyof T> {
  return Object.keys(_) as Array<keyof T>;
}