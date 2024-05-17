import { Handlers } from "$fresh/server.ts";
import Builder from "../../../libs/builder.ts";
import { getSchema } from "../../../libs/helper.ts";
import { State } from "../../_middleware.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(_, ctx) {
    const collection = ctx.params.collection;
    const schema = getSchema(ctx, collection);
    if (!schema) return new Response("{}", { status: 404 });

    const q: Record<string, string | WhereQuery> = {};
    const jq: Record<string, string> = {};
    for (const [key, value] of ctx.state.query.entries()) {
      if (value) jq[key] = value
    }
    let searchTokens: string[] = [];
    let fields: string[] = [];

    if (jq["search"]) {
      searchTokens = jq["search"].replaceAll(/^s+/g, " ").trim().split(" ");
      delete jq["search"];
    }

    if (jq["fields"]) {
      const f = jq["fields"];
      fields = f.split(",");
      delete jq["fields"];
    }
    for (const [k, v] of Object.entries(jq)) {
      const attr = schema.attributes.find((attr) => attr.field == k);
      if (attr) {
        const hasDirectParentRelation = attr.type === "relation" &&
          attr.relation.type === "oneToMany" &&
          attr.relation.reference === "forward";
        const belongToWithJoinRelation = attr.type === "join-relation" &&
          (attr.relation === "belongsTo" ||
            attr.relation === "belongsToMany");
        q[
          `${hasDirectParentRelation
            ? attr.target.replace(":", ".")
            : belongToWithJoinRelation
              ? attr.joinTableName + "." + attr.joinReferenceKey
              : k
          }`
        ] = v;
      } else q[`${schema.table}.${k}`] = v;
    }
    for (const f of fields) {
      q[`${schema.table}.${f}`] = { operator: "LIKE", value: searchTokens };
    }

    const { data } = await Builder.instance().getAll(schema, q, false, 1, 500);
    return new Response(JSON.stringify({ data, schema }), {
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
