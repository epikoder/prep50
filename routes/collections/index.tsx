import { PageProps } from "$fresh/server.ts";
import { getCollections } from "../../libs/helper.ts";
import { FreshApp } from "../_middleware.ts";

export function handler(req: Request, ctx: FreshApp) {
  const collections = getCollections(ctx);
  return ctx.render({ collections });
}

export default function Collections({ data }: PageProps) {
  const { collections } = data as { collections: string[] };
  return (
    <div class="flex flex-col min-h-[200px] w-full justify-center items-center">
      {"View, Update or Delete Resource"}
    </div>
  );
}
