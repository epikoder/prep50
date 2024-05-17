import { Handlers } from "$fresh/server.ts";
import Builder from "../../../libs/builder.ts";
import { State } from "../../_middleware.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
    async PUT(req, _) {
        const body = await req.json() as UpdateRequest<IQuestion[]>
        const conn = await Builder.getConnection();
        switch (body.action) {
            case 'delete': {
                if (body.data.length == 0) return new Response(JSON.stringify({
                    status: 'success',
                } as Api));

                const idx = body.data.map((v) => v.question_id)
                const v = body.data[0]
                await (conn).query("DELETE FROM publish_questions WHERE id = ? AND subject_id = ? AND topic_id = ? AND sub_topic_id = ? AND question_id IN ?", [v.id, v.subject_id, v.topic_id, v.sub_topic_id, idx]);
                break;
            }
            default:
                for (const v of body.data) {
                    await (conn).query("UPDATE publish_questions SET idx = ? WHERE id = ? AND subject_id = ? AND topic_id = ? AND sub_topic_id = ? AND question_id = ?", [v.idx, v.id, v.subject_id, v.topic_id, v.sub_topic_id, v.question_id]);
                }
        }
        return new Response(JSON.stringify({
            status: 'success',
        } as Api))
    },
};
