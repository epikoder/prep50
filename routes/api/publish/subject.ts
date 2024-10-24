import { Handlers } from "$fresh/server.ts";
import Builder from "../../../libs/builder.ts";
import { State } from "../../_middleware.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
    async PUT(req, _) {
        const body = await req.json() as UpdateRequest<ISubject[]>
        const conn = await Builder.getConnection();
        switch (body.action) {
            case 'delete': {
                if (body.data.length == 0) return new Response(JSON.stringify({
                    status: 'success',
                } as Api));

                const idx = body.data.map((v) => v.subject_id)
                const v = body.data[0]
                await (conn).query("DELETE FROM publish_subjects WHERE id = $1 AND subject_id IN ($2)", [v.id, idx]);
                break;
            }
            default:
                for (const v of body.data) {
                    await (conn).query("UPDATE publish_subjects SET idx = ? WHERE id = ? AND subject_id = ?", [v.idx, v.id, v.subject_id]);
                }
        }
        return new Response(JSON.stringify({
            status: 'success',
        } as Api))
    },
};
