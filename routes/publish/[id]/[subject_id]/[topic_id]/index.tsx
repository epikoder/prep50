import { PageProps } from "$fresh/server.ts";
import SubTopicList from "../../../../../islands/publish/SubTopicList.tsx";
import Builder from "../../../../../libs/builder.ts";
import { FreshApp } from "../../../../_middleware.ts";

type T = ISubTopic[];
export const handler = async (req: Request, ctx: FreshApp) => {
  const id = ctx.params.id;
  const subject_id = ctx.params.subject_id;
  const topic_id = ctx.params.topic_id;
  const conn = await Builder.getConnection();

  return ctx.render(
    await conn.query(
      `SELECT pst.*, o.title FROM publish_sub_topics AS pst 
    LEFT JOIN objectives AS o ON o.id = pst.sub_topic_id
    WHERE pst.id = ? AND pst.subject_id = ? AND pst.topic_id = ? ORDER BY pst.idx`,
      [
        id,
        subject_id,
        topic_id,
      ],
    ),
  );
};

export default function _({ data, params }: PageProps<T>) {
  return (
    <div class={"px-2"}>
      <div class={"py-8 mx-auto max-w-screen-sm"}>
        <SubTopicList
          items={data}
          id={params.id}
          subject_id={params.subject_id as unknown as number}
          topic_id={params.topic_id as unknown as number}
        />
      </div>
    </div>
  );
}
