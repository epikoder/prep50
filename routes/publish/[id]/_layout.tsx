import { LayoutConfig, PageProps } from "$fresh/server.ts";
import { Fragment } from "preact/jsx-runtime";
import PublishTitle from "../../../islands/publish/PublishTitle.tsx";
import { FreshApp } from "../../_middleware.ts";
import Builder from "../../../libs/builder.ts";
import RouteList from "../../../config/route_list.ts";

export default async function _(_: Request, ctx: FreshApp) {
  const links: { title: string; uri: string }[] = [];
  let uri = ctx.url.pathname.slice(1);
  const conn = await Builder.getConnection();
  for (const i of RouteList) {
    const v = ctx.params[i.key];
    if (v) {
      const result = await conn.query(i.query, [v]) as { title: string }[];
      if (result.length == 0) {
        return new Response("", {
          status: 303,
          headers: {
            location: "/publish",
          },
        });
      }
      const title = result[0].title;

      let link = uri.slice(0, uri.indexOf(v) + v.length);
      uri = uri.slice(link.length + 1);
      link = links.length == 0
        ? "/" + link
        : links[links.length - 1].uri + "/" + link;
      links.push({
        title: title,
        uri: link,
      });
    }
  }

  return (
    <Fragment>
      <div class={"flex flex-wrap justify-center max-w-screen-md mx-auto"}>
        {links.map((v, i) => (
          <Fragment>
            <PublishTitle {...v} />
            {i < links.length - 1 && <span class={"px-1"}>/</span>}
          </Fragment>
        ))}
      </div>
      <ctx.Component />
    </Fragment>
  );
}
