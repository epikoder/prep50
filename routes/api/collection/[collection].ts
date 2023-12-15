import { Handlers } from "$fresh/server.ts";
import Builder from "../../../libs/builder.ts";
import { getSchema } from "../../../libs/helper.ts";
import { State } from "../../_middleware.ts";

export const handler: Handlers<any, State> = {
  async GET(_, ctx) {
    const collection = ctx.params.collection;
    const schema = getSchema(ctx, collection);
    if (!schema) return new Response("{}", { status: 404 });

    const q: Record<string, string> = {};
    for (const [k, v] of Object.entries(ctx.state.jsonQuery)) {
      const attr = schema.attributes.find((attr) => attr.field == k);
      if (attr) {
        const hasDirectParentRelation = attr.type === "relation" &&
          attr.relation.type === "oneToMany" &&
          attr.relation.reference === "forward";
        const belongToWithJoinRelation = attr.type === "join-relation" &&
          (attr.relation === "belongsTo" ||
            attr.relation === "belongsToMany");
        q[
          `${
            hasDirectParentRelation
              ? attr.target.replace(":", ".")
              : belongToWithJoinRelation
              ? attr.joinTableName + "." + attr.joinReferenceKey
              : k
          }`
        ] = v;
      } else q[`${schema.table}.${k}`] = v;
    }
    const { data } = await Builder.instance().getAll(schema, q, false);
    return new Response(JSON.stringify({ data }), {
      headers: {
        "content-type": "application/json",
      },
    });
  },
  POST(_, __) {
    return new Response(JSON.stringify(null), {
      headers: {
        "content-type": "application/json",
      },
    });
  },
  async DELETE(_, ctx) {
    const collection = ctx.params.collection;
    const schema = getSchema(ctx, collection);
    if (!schema) return new Response("{}", { status: 404 });

    const id = ctx.state.query.get("id");
    if (!id) return new Response("{}", { status: 400 });

    await Builder.instance().delete(schema, id);
    return new Response(JSON.stringify(null), {
      headers: {
        "content-type": "application/json",
      },
    });
  },
};
