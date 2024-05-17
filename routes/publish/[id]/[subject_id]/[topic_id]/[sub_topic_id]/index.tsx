import { PageProps } from "$fresh/server.ts";
import QuestionList from "../../../../../../islands/publish/QuestionList.tsx";
import Builder from "../../../../../../libs/builder.ts";
import { FreshApp } from "../../../../../_middleware.ts";

type T = (IQuestion & { question: Question })[];
export const handler = async (req: Request, ctx: FreshApp) => {
  const id = ctx.params.id;
  const subject_id = ctx.params.subject_id;
  const topic_id = ctx.params.topic_id;
  const sub_topic_id = ctx.params.sub_topic_id;
  const conn = await Builder.getConnection();

  const idx = await conn.query(
    `SELECT pq.*, q.id AS 'q_id', q.question AS 'q_question', q.question_details AS 'q_question_details',
    q.question_image AS 'q_question_image', q.answer_details AS 'q_answer_details', q.passage AS 'q_passage',
    q.tag AS 'q_tag', q.question_type_id AS 'q_question_type_id', q.option_1 AS 'q_option_1', q.option_2 AS 'q_option_2',
    q.option_3 AS 'q_option_3', q.option_4 AS 'q_option_4', q.short_answer AS 'q_short_answer', q.full_answer AS 'q_full_answer',
    q.answer_image  AS 'q_answer_image'
  FROM publish_questions AS pq
  LEFT JOIN objective_questions AS oq ON oq.question_id = pq.question_id
  LEFT JOIN questions AS q ON q.id = oq.question_id
  WHERE pq.id = ? AND pq.subject_id = ? AND pq.topic_id = ? AND pq.sub_topic_id = ? ORDER BY pq.idx`,
    [
      id,
      subject_id,
      topic_id,
      sub_topic_id,
    ],
  ) as any[];

  return ctx.render(idx.map((v) => ({
    id: v.id,
    idx: v.idx,
    question_id: v.question_id,
    sub_topic_id: v.sub_topic_id,
    subject_id: v.subject_id,
    topic_id: v.topic_id,
    question: {
      id: v.q_id,
      question: v.q_question,
      full_answer: v.q_full_answer,
      option_1: v.q_option_1,
      option_2: v.q_option_2,
      option_3: v.q_option_3,
      option_4: v.q_option_4,
      question_type_id: v.q_question_type_id,
      short_answer: v.q_short_answer,
      tag: v.q_tag,
      answer_details: v.q_answer_details,
      answer_image: v.q_answer_image,
      passage: v.q_passage,
      question_details: v.q_question_details,
      question_image: v.q_question_image,
    },
  } as T[number])));
};

export default function _({ data, params }: PageProps<T>) {
  return (
    <div class={"px-2"}>
      <div class={"py-8 mx-auto max-w-screen-md"}>
        <QuestionList
          items={data}
          id={params.id}
          subject_id={params.subject_id as unknown as number}
          topic_id={params.topic_id as unknown as number}
          sub_topic_id={params.sub_topic_id as unknown as number}
        />
      </div>
    </div>
  );
}
