import { Handlers } from "$fresh/server.ts";
import Builder from "../../../libs/builder.ts";
import { State } from "../../_middleware.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
    async PUT(req, _) {
        const body = await req.json() as UpdateRequest<ISubTopic[]>;
        const conn = await Builder.getConnection();
        switch (body.action) {
            case "delete": {
                if (body.data.length == 0) {
                    return new Response(JSON.stringify({
                        status: "success",
                    } as Api));
                }

                const idx = body.data.map((v) => v.sub_topic_id);
                const v = body.data[0];
                await conn.query(
                    "DELETE FROM publish_sub_topics WHERE id = $1 AND subject_id = $2 AND topic_id = $3 AND sub_topic_id IN ($4)",
                    [v.id, v.subject_id, v.topic_id, idx],
                );
                break;
            }
            default:
                for (const v of body.data) {
                    await conn.query(
                        "UPDATE publish_sub_topics SET idx = $1 WHERE id = $2 AND subject_id = $3 AND topic_id = $4 AND sub_topic_id = $5",
                        [v.idx, v.id, v.subject_id, v.topic_id, v.sub_topic_id],
                    );
                }
        }

        return new Response(JSON.stringify({
            status: "success",
        } as Api));
    },
};
