import { PageProps } from "$fresh/server.ts";
import SubjectList from "../../../islands/publish/SubjectList.tsx";
import PublishTitle from "../../../islands/publish/PublishTitle.tsx";
import Builder from "../../../libs/builder.ts";
import { FreshApp } from "../../_middleware.ts";

export const handler = async (req: Request, ctx: FreshApp) => {
  const id = ctx.params.id;
  const conn = await Builder.getConnection();
  const r = await conn.query("SELECT id,title FROM publishes WHERE id = ?", [
    id,
  ]) as IPublish[];
  return ctx.render({
    ...r[0],
    subjects: await conn.query(
      `SELECT ps.subject_id,s.name,ps.idx FROM publish_subjects AS ps
        LEFT JOIN subjects AS s ON s.id = ps.subject_id
        WHERE ps.id = ? ORDER BY ps.idx`,
      [r[0].id],
    ),
  });
};

export default function _(
  { data }: PageProps<
    IPublish & { subjects: (ISubject & { name: string })[] }
  >,
) {
  return (
    <div class={"px-2"}>
      <div class={"py-8 mx-auto max-w-screen-sm"}>
        <SubjectList
          items={data.subjects.map((v) => ({ ...v, id: data.id }))}
          id={data.id}
          title={data.title}
        />
      </div>
    </div>
  );
}
