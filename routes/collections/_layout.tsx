import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import CollectionIcon from "../../islands/Icons/CollectionIcon.tsx";
import ManangeIcon from "../../islands/Icons/ManangeIcon.tsx";
import { FreshApp } from "../_middleware.ts";
import { getCollections } from "../../libs/helper.ts";
import UserIcon from "../../islands/Icons/UserIcon.tsx";

// deno-lint-ignore require-await
export default async function CollectionLayout({ url }: Request, ctx: FreshApp) {
  const collections = getCollections(ctx);
  return (
    <div class={"flex space-x-2 py-2 px-4"}>
      <div class={"space-y-2 w-md"}>
        {collections.map((v, i) => (
          <div>
            <a
              key={i}
              href={"/collections/" + v}
            >
              <div
                class={"uppercase text-xs p-3 transition-all duration-300 hover:text-gray-700 dark:hover:text-gray-400"}
              >
                {v}
              </div>
            </a>
          </div>
        ))}
      </div>
      <ctx.Component />
    </div>
  );
}
