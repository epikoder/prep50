import { Handlers } from "$fresh/server.ts";

import { State } from "../../_middleware.ts";
import Builder from "../../../libs/builder.ts";
import HTMLtoDOCX from "npm:html-to-docx";
import { Buffer } from "https://deno.land/std@0.83.0/node/buffer.ts";

type Q = UntypedQuestion & ObjectiveQuestion
type T = Q & {
    subject_id: number;
    idx: number;
    p_id: string;
    p_title: string;
    s_name: string;
    s_idx: number;
    topic_id: number
    t_title: string;
    t_details: string;
    t_idx: number;
    sub_topic_id: number
    sub_title: string;
    sub_details: string;
    sub_idx: number;
};

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
    async GET(_, ctx) {
        const id = ctx.state.query.get("id")
        const conn = await Builder.getConnection();
        const statement = `
            SELECT 
                q.*, 
                pq.idx, 
                p.id AS p_id, 
                p.title AS p_title,
                s.name AS s_name, 
                s.idx AS s_idx, 
                t.title AS t_title, 
                t.details AS t_details,
                t.topic_id AS topic_id, 
                t.idx AS t_idx, 
                sub.title AS sub_title,
                sub.details AS sub_details, 
                sub.sub_topic_id AS sub_topic_id, 
                sub.idx AS sub_idx
            FROM 
                questions AS q 
            JOIN 
                (SELECT pq.* FROM publish_questions AS pq JOIN questions AS q ON q.id = pq.question_id) AS pq ON pq.question_id = q.id
            JOIN 
                objective_questions AS oq ON oq.question_id = q.id 
            JOIN 
                (SELECT sub.*, o.title, o.details FROM publish_sub_topics AS sub JOIN objectives AS o ON o.id = sub.sub_topic_id) AS sub ON sub.sub_topic_id = oq.objective_id
            JOIN 
                (SELECT t.*, _t.title, _t.details FROM publish_topics AS t JOIN topics AS _t ON _t.id = t.topic_id) AS t ON t.topic_id = sub.topic_id
            JOIN 
                (SELECT s.*, _s.name FROM publish_subjects AS s JOIN subjects AS _s ON _s.id = s.subject_id) AS s ON s.subject_id = t.subject_id
            JOIN 
                publishes AS p ON p.id = pq.id
            WHERE 
                p.id = ?
            ORDER BY 
                s_idx, t_idx, sub_idx, idx;
            `;
        try {
            const data = <T[]>await conn.query(statement, [id]);
            // const doc = generate_docx(transform_data(data));

            // // Used to export the file into a .docx file
            // Packer.toBuffer(doc).then((buffer) => {
            //     Deno.writeFileSync("My Document.docx", buffer);
            // });
            return new Response(JSON.stringify({
                status: 'success',
                data: transform_data(data)
            } as Api))
        } catch (error) {
            console.error(error)
            return new Response(JSON.stringify({
                status: 'failed',
            } as Api))
        }

    },

    async POST(req, _) {
        const h = (await req.json()).html
        const buffer: Buffer = await HTMLtoDOCX(h, '', {
            margins: {
                top: 1000,
                bottom: 1000,
                left: 1250,
                right: 1250
            },
            fontSize: 15,
        })
        return new Response(buffer.buffer, {
            headers: {
                'content-type':'application/octet-stream'
            }
        })
    }
}
interface SUB {
    name: string,
    topics: TOP[]
}
interface TOP {
    title: string
    details: string
    sub_topics: SUBTOPIC[]
}
interface SUBTOPIC {
    title: string
    details: string
    questions: T[]
}

const transform_data = (data: T[]): SUB[] => {
    const vars: SUB[] = [];
    for (let i = 0; i < data.length; i++) {
        const el = data[i];
        let si = vars.findIndex(s => s.name == el.s_name)
        if (si == -1) si = vars.push({ name: el.s_name, topics: [] }) - 1;

        let ti = vars[si].topics.findIndex(t => t.title == el.t_title)
        if (ti == -1) ti = vars[si].topics.push({ title: el.t_title, details: el.t_details, sub_topics: [] }) - 1;

        let subi = vars[si].topics[ti].sub_topics.findIndex(t => t.title == el.sub_title)
        if (subi == -1) subi = vars[si].topics[ti].sub_topics.push({ title: el.sub_title, details: el.sub_details, questions: [] }) - 1;

        vars[si].topics[ti].sub_topics[subi].questions.push(el);
    }
    return vars
}
