import { Handlers, PageProps } from "$fresh/server.ts";
import { useSignal } from "@preact/signals";
import Builder from "../../../../../../libs/builder.ts";
import SubTopicSelector from "../../../../../../islands/publish/SubTopicSelector.tsx";

export const handler: Handlers = {
  async GET(_, ctx) {
    const topic_id = ctx.params.topic_id;
    const conn = await Builder.getConnection();
    return ctx.render(
      await conn.query(
        `SELECT o.id, o.title FROM objectives AS o 
        LEFT JOIN topic_objectives AS _to ON _to.objective_id = o.id 
        LEFT JOIN topics AS t ON t.id = _to.topic_id
        WHERE t.id = ? AND o.id NOT IN (SELECT sub_topic_id FROM publish_sub_topics WHERE id = ? AND subject_id = ? AND topic_id = ?)
        `,
        [topic_id, ctx.params.id, ctx.params.subject_id, ctx.params.topic_id],
      ),
    );
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const topic_id = ctx.params.topic_id;
    const subject_id = ctx.params.subject_id;
    const id = ctx.params.id;

    const sub_topic_id = form.get("sub_topic_id");
    if (!sub_topic_id) {
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
        "SELECT COUNT(id) as _count FROM publish_sub_topics WHERE id = ? AND subject_id = ? AND topic_id = ?",
        [id, subject_id, topic_id],
      ) as { _count: number }[];

      await conn.execute(
        "INSERT INTO publish_sub_topics(id, subject_id, topic_id, sub_topic_id, idx) VALUES(?,?,?,?,?)",
        [id, subject_id, topic_id, sub_topic_id, r[0]._count + 1],
      );
      return new Response("", {
        status: 303,
        headers: {
          location: `/publish/${id}/${subject_id}/${topic_id}`,
          ["flash-message"]: "Sub-topic added successfully",
        },
      });
    } catch (error) {
      console.error(error);
      return new Response("", {
        status: 303,
        headers: {
          location: `/publish/${id}/${subject_id}/${topic_id}`,
          ["flash-message"]: "Failed to add Sub-topic",
        },
      });
    }
  },
};

export default function _(
  { data, params }: PageProps<ISubTopic[]>,
) {
  const selected = useSignal<ISubTopic | undefined>(undefined);

  return (
    <div class={"px-2"}>
      <form method={"POST"}>
        <div class={"py-8 mx-auto max-w-screen-md"}>
          <SubTopicSelector
            controller={selected}
            sub_topics={data}
          />
        </div>

        <button
          class={"rounded-md bg-[#46b5ff] w-48 hover:bg-opacity-95 active:bg-opacity-70 transition-all duration-300 flex justify-center space-x-2 items-center text-white shadow-md mx-auto px-4"}
        >
          <span class={"text-xs uppercase bold"}>
            {"Save"}
          </span>
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
        </button>
      </form>
    </div>
  );
}
