import { Handlers } from "$fresh/server.ts";
import { cryptoRandomString } from "random";
import Builder from "../../../libs/builder.ts";
import { State } from "../../_middleware.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(_, __) {
    const r = await (await Builder.getConnection()).query(`
    SELECT p.id, p.title, COALESCE(subject_count, 0) AS subject_count
    FROM publishes p
    LEFT JOIN (
      SELECT id, COUNT(subject_id) AS subject_count
      FROM publish_subjects
      GROUP BY id
    ) ps ON p.id = ps.id;
    `) as IPublish[]
    return new Response(JSON.stringify({ status: 'success', data: r } as Api));
  },

  async POST(req, _) {
    const id = crypto.randomUUID();
    const body = (await req.json()) as Record<string, string>
    if (!body.subject || !body.title) return new Response(JSON.stringify({
      status: 'failed',
      $meta: {
        message: 'Please fill the form correctly'
      }
    }),)
    const slug = (body.title + '-' + cryptoRandomString({ length: 12 })).replaceAll(' ', '-').toLowerCase()
    try {
      await (await Builder.getConnection()).query("INSERT INTO publishes(id,title,slug) VALUES (?, ?, ?)", [id, body.title, slug])
      await (await Builder.getConnection()).query("INSERT INTO publish_subjects(id,subject_id,idx) VALUES (?, ?, ?)", [id, body.subject, 1])
      return new Response(JSON.stringify({
        status: 'success',
        data: { id }
      } as Api));
    } catch (error) {
      console.log({ error })
      return new Response(JSON.stringify({
        status: 'failed',
        $meta: { error: 'internal server error' }
      } as Api));
    }
  },

  async PUT(req, _) {
    const body = await req.json() as UpdateRequest<string>
    const conn = await Builder.getConnection();
    switch (body.action) {
      case 'delete': {
        await (conn).query("DELETE FROM publishes WHERE id = ?", [body.data]);
        break;
      }
    }

    return new Response(JSON.stringify({
      status: 'success',
    } as Api))
  },
};
