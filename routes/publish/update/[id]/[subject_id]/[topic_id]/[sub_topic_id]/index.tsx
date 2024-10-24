import { Handlers, PageProps } from "$fresh/server.ts";
import { useSignal } from "@preact/signals";
import Builder from "../../../../../../../libs/builder.ts";
import QuestionSelector from "../../../../../../../islands/publish/QuestionSelector.tsx";

export const handler: Handlers = {
  async GET(_, ctx) {
    const sub_topic_id = ctx.params.sub_topic_id;
    const conn = await Builder.getConnection();
    return ctx.render(
      await conn.query(
        `SELECT q.* 
FROM questions AS q
LEFT JOIN objective_questions AS oq ON oq.question_id = q.id
WHERE oq.objective_id = $1 
AND q.question_type_id = '1'
AND q.id NOT IN (
  SELECT question_id 
  FROM publish_questions 
  WHERE id = $2 
  AND subject_id = $3 
  AND topic_id = $4
);
`,
        [
          sub_topic_id,
          ctx.params.id,
          ctx.params.subject_id,
          ctx.params.topic_id,
          ctx.params.sub_topic_id,
        ],
      ),
    );
  },
  async POST(req, ctx) {
    const sub_topic_id = ctx.params.sub_topic_id;
    const topic_id = ctx.params.topic_id;
    const subject_id = ctx.params.subject_id;
    const id = ctx.params.id;

    const question_idx = await req.json() as Record<string, string>;

    if (!question_idx || Object.keys(question_idx).length == 0) {
      return new Response(JSON.stringify({
        status: "failed",
        $meta: {
          message: "No question selected",
        },
      } as Api));
    }

    const conn = await Builder.getConnection();
    try {
      const idx = Object.values(question_idx).filter((v) => !!v).sort((a, b) =>
        parseInt(a.toString()) - parseInt(b.toString())
      );

      const r = await conn.query(
        "SELECT COUNT(id) as _count FROM publish_questions WHERE id = ? AND subject_id = ? AND topic_id = ? AND sub_topic_id = ?",
        [id, subject_id, topic_id, sub_topic_id],
      ) as { _count: number }[];

      const insert_stm =
        "INSERT INTO publish_questions(id, subject_id, topic_id, sub_topic_id, question_id, idx)";
      let values = "VALUES";
      for (let i = 0; i < idx.length; i++) {
        values = values.concat(
          `('${id}', ${parseInt(subject_id)}, ${parseInt(topic_id)}, ${parseInt(sub_topic_id)
          }, ${parseInt(idx[i])}, ${r[0]._count + 1 + i})`,
          (i == idx.length - 1) ? "" : ",",
        );
      }

      await conn.query(
        insert_stm.concat(" ", values),
      );
      return new Response(JSON.stringify({
        status: "success",
        $meta: {
          message: "Saved successfully",
        },
      } as Api));
    } catch (error) {
      console.error(new Error(error).message);
      return new Response(JSON.stringify({
        status: "failed",
        $meta: {
          message: "Unexpected error occured",
        },
      } as Api));
    }
  },
};

export default function _(
  { data, params }: PageProps<Question[]>,
) {
  const selected = useSignal<Record<string, string>>({});

  return (
    <QuestionSelector
      controller={selected}
      questions={data}
    />
  );
}
