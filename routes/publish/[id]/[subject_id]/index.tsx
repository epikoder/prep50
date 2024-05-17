import { PageProps } from "$fresh/server.ts";
import PublishTitle from "../../../../islands/publish/PublishTitle.tsx";
import TopicList from "../../../../islands/publish/TopicList.tsx";
import Builder from "../../../../libs/builder.ts";
import { FreshApp } from "../../../_middleware.ts";

type T = ITopic[];
export const handler = async (req: Request, ctx: FreshApp) => {
  const subject_id = ctx.params.subject_id;
  const id = ctx.params.id;
  const conn = await Builder.getConnection();

  return ctx.render(
    await conn.query(
      `SELECT t.title, pt.* FROM publish_topics AS pt 
    LEFT JOIN topics AS t ON t.id = pt.topic_id
    WHERE pt.id = ? AND pt.subject_id = ? ORDER BY pt.idx`,
      [
        ctx.params.id,
        subject_id,
      ],
    ),
  );
};

export default function _({ data, params }: PageProps<T>) {
  return (
    <div class={"px-2"}>
      <div class={"py-8 mx-auto max-w-screen-sm"}>
        <TopicList
          items={data}
          id={params.id}
          subject_id={params.subject_id as unknown as number}
        />
      </div>
    </div>
  );
}
