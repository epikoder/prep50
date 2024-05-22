import { Handlers, PageProps } from "$fresh/server.ts";
import PillButton from "../../../../components/PillButton.tsx";
import SubjectSelector from "../../../../islands/publish/SubjectSelector.tsx";
import Builder from "../../../../libs/builder.ts";
import { useSignal } from "@preact/signals";

export const handler: Handlers = {
  async GET(_, ctx) {
    const conn = await Builder.getConnection();

    const id = ctx.params.id;
    return ctx.render(
      await conn.query(
        `SELECT * FROM subjects WHERE id NOT IN (SELECT subject_id FROM publish_subjects WHERE id = ?)`,
        [id],
      ),
    );
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const subject_id = form.get("subject_id");
    const id = ctx.params.id;
    if (!subject_id) {
      return new Response("", {
        status: 303,
        headers: {
          location: ctx.url.pathname,
        },
      });
    }
    const conn = await Builder.getConnection();
    try {
      const r = await conn.query(
        "SELECT COUNT(id) as _count FROM publish_subjects WHERE id = ?",
        [id],
      ) as { _count: number }[];

      await conn.execute(
        "INSERT INTO publish_subjects(id,subject_id,idx) VALUES(?,?,?)",
        [id, subject_id, r[0]._count + 1],
      );
      return new Response("", {
        status: 303,
        headers: {
          location: `/publish/${id}`,
          ["flash-message"]: "Subject added successfully",
        },
      });
    } catch (error) {
      return new Response("", {
        status: 303,
        headers: {
          location: `/publish/${id}`,
          ["flash-message"]: "Failed to add subject",
        },
      });
    }
  },
};

export default function _(
  { data, params }: PageProps<ISubject[]>,
) {
  const selected = useSignal<ISubject | undefined>(undefined);
  return (
    <div class={"px-2"}>
      <form method={"POST"}>
        <div class={"py-8 mx-auto max-w-screen-md"}>
          <SubjectSelector controller={selected} subjects={data} />
        </div>

        <PillButton
          text={"save"}
          iconData={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 p-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
        />
      </form>
    </div>
  );
}
