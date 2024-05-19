import { Handlers } from "$fresh/server.ts";

import { Document, Packer, Paragraph, TextRun, ColumnBreak, ISectionOptions, SectionType, PageBreak, ParagraphChild, convertInchesToTwip } from "npm:docx";
import { State } from "../../_middleware.ts";
import Builder from "../../../libs/builder.ts";
import { decode } from "https://esm.sh/he@1.2.0";
import HTMLtoDOCX from "npm:html-to-docx";

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
    t_idx: number;
    sub_topic_id: number
    sub_title: string;
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
                t.topic_id AS topic_id, 
                t.idx AS t_idx, 
                sub.title AS sub_title, 
                sub.sub_topic_id AS sub_topic_id, 
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
            WHERE 
                p.id = ?
            ORDER BY 
                s_idx, t_idx, sub_idx, idx;
            `;
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
    },

    async POST(req, _) {
        Deno.writeFileSync("My Document2.docx", await HTMLtoDOCX((await req.json()).html));
        return new Response()
    }
}
interface SUB {
    name: string,
    topics: TOP[]
}
interface TOP {
    title: string
    sub_topics: SUBTOPIC[]
}
interface SUBTOPIC {
    title: string
    questions: T[]
}

const transform_data = (data: T[]): SUB[] => {
    const vars: SUB[] = [];
    for (let i = 0; i < data.length; i++) {
        const el = data[i];
        let si = vars.findIndex(s => s.name == el.s_name)
        if (si == -1) si = vars.push({ name: el.s_name, topics: [] }) - 1;

        let ti = vars[si].topics.findIndex(t => t.title == el.t_title)
        if (ti == -1) ti = vars[si].topics.push({ title: el.t_title, sub_topics: [] }) - 1;

        let subi = vars[si].topics[ti].sub_topics.findIndex(t => t.title == el.sub_title)
        if (subi == -1) subi = vars[si].topics[ti].sub_topics.push({ title: el.sub_title, questions: [] }) - 1;

        vars[si].topics[ti].sub_topics[subi].questions.push(el);
    }
    return vars
}

const generate_docx = (data: SUB[]): Document => {
    const sections: Writable<ISectionOptions>[] = [];

    for (const sub of data) {
        sections.push({
            children: [_buildSubjectHeader(sub.name)],
            properties: {
                type: SectionType.CONTINUOUS,
                page: {
                    margin: {
                        left: 50,
                        right: 50,
                        bottom: 50,
                    },
                },
            }
        });
        for (const topic of sub.topics) {
            console.log("IN TOPIC -- ", topic.title)
            sections.push({
                children: [_buildTopicTitle(decode(topic.title))],
                properties: {
                    type: SectionType.CONTINUOUS,
                    page: {
                        margin: {
                            left: 50,
                            right: 50,
                            bottom: 50,
                        },
                    },
                }
            })
            for (const sub_topic of topic.sub_topics) {
                console.log("IN SUB - TOPIC -- ", sub_topic.title)
                sections.push({
                    properties: {
                        type: SectionType.CONTINUOUS,
                        page: {
                            margin: {
                                left: 50,
                                right: 50,
                                bottom: 50,
                            },
                        },
                    },
                    children: [_buildSubTitle(decode(sub_topic.title))]
                });
                const section: Writable<ISectionOptions> = {
                    properties: {
                        type: SectionType.CONTINUOUS,
                        column: {
                            count: 2
                        }
                    },
                    children: []
                }
                for (let i = 0; i < sub_topic.questions.length; i++) {
                    const x = _buildQuestion(sub_topic.questions[i], Math.floor(sub_topic.questions.length / 2) == i);
                    section.children.push(x)
                }
                section.children.push(new Paragraph({
                    children: [],
                }))
                sections.push(section)
            }
        }
        sections[sections.length - 1].children.push(new Paragraph({
            children: [new PageBreak()]
        }))
    }

    return new Document({
        numbering: {
            config: data.map(s => {
                let reference = "";
                for (const sub of data) {
                    for (const topic of sub.topics) {
                        for (const sub_topic of topic.sub_topics) {
                            reference = `${sub.name}-${decode(topic.title)}-${decode(sub_topic.title)}`
                        }
                    }
                    sections[sections.length - 1].children.push(new Paragraph({
                        children: [new PageBreak()]
                    }))
                }
                return {
                    reference,
                    levels: [
                        {
                            level: 0,
                            // format: LevelFormat.UPPER_ROMAN,
                            text: "%1",
                            // alignment: AlignmentType.START,
                            style: {
                                paragraph: {
                                    indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.18) },
                                },
                            },
                        }
                    ]
                }
            })
        },
        sections: sections as unknown as ISectionOptions[]
    });
}

const _buildSubjectHeader = (text: string) => new Paragraph({
    alignment: 'center',
    spacing: {
        // line: 2
    },
    children: [new TextRun({
        text,
        bold: true,
        allCaps: true,
    })]
})

const _buildTopicTitle = (text: string) => new Paragraph({
    alignment: 'center',
    children: [
        new TextRun({
            text,
            allCaps: true,
        }),
    ]
})

const _buildSubTitle = (text: string) => new Paragraph({
    text,
    alignment: 'center'
})
const _buildAnswers = () => new Paragraph({})
const _buildQuestion = (qx: T, column_break: boolean) => {
    return new Paragraph({
        numbering: {
            level: 0,
            reference: `${qx.s_name}-${decode(qx.t_title)}-${decode(qx.sub_title)}`,
        },
        children: [
            new TextRun({
                text: stripHtmlTags(qx.question),
            }),
            _buildQuestionImage(),
            ...[qx.option_1, qx.option_2, qx.option_3, qx.option_4].map(o => _buildQuestionOption(decode(o))),
            ... (column_break ? [new ColumnBreak()] : [])
        ]
    })
}
const _buildQuestionImage = (): ParagraphChild => new Paragraph({})
const _buildQuestionOption = (text: string): ParagraphChild => new TextRun({ text })

function stripHtmlTags(htmlString: string): string {
    const doc = new DOMParser().parseFromString(htmlString, 'text/html');
    if (!doc) {
        throw new Error("Failed to parse HTML");
    }
    const plainText = doc.body.textContent || '';

    return plainText;
}
