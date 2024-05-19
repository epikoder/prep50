import { Handlers } from "$fresh/server.ts";
import Builder from "../../../libs/builder.ts";
import { State } from "../../_middleware.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
    async POST(req, ctx) {
        const { id, subject_id } = <{ id: string, subject_id: string[] }>await req.json();
        if (!id) return new Response(JSON.stringify({
            status: 'failed'
        } as Api))
        const conn = await Builder.getConnection();

        let statement = `
        SELECT 
            q.*, 
            pq.idx, 
            p.id AS p_id, 
            p.title AS p_title,
            s.name AS s_name, 
            s.idx AS s_idx, 
            t.title AS t_title, 
            t.idx AS t_idx, 
            sub.title AS sub_title, 
            sub.idx AS sub_idx
        FROM 
            questions AS q 
        JOIN 
            (SELECT pq.* FROM publish_questions AS pq JOIN questions AS q ON q.id = pq.question_id) AS pq ON pq.question_id = q.id
        JOIN 
            objective_questions AS oq ON oq.question_id = q.id 
        JOIN 
            (SELECT sub.*, o.title FROM publish_sub_topics AS sub JOIN objectives AS o ON o.id = sub.sub_topic_id) AS sub ON sub.sub_topic_id = oq.objective_id
        JOIN 
            (SELECT t.*, _t.title FROM publish_topics AS t JOIN topics AS _t ON _t.id = t.topic_id) AS t ON t.topic_id = sub.topic_id
        JOIN 
            (SELECT s.*, _s.name FROM publish_subjects AS s JOIN subjects AS _s ON _s.id = s.subject_id) AS s ON s.subject_id = t.subject_id
        JOIN 
            publishes AS p ON p.id = pq.id
        WHERE p.id = ?`;
        // deno-lint-ignore no-explicit-any
        const q: any[] = [id]
        if (subject_id.length > 0) {
            statement = statement.concat(' AND s.subject_id IN ?')
            q.push(subject_id.map(s => parseInt(s)))
        }
        statement = statement.concat(` ORDER BY s_idx, t_idx, sub_idx, idx;`)
        const data = await conn.query(statement, q);
        return new Response(JSON.stringify({
            status: 'success',
            data
        } as Api))
    }
};
