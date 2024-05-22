import { Handlers, PageProps } from "$fresh/server.ts";
import TopicSelector from "../../../../../islands/publish/TopicSelector.tsx";
import Builder from "../../../../../libs/builder.ts";
import { useSignal } from "@preact/signals";

export const handler: Handlers = {
  async GET(_, ctx) {
    const subject_id = ctx.params.subject_id;
    const conn = await Builder.getConnection();

    return ctx.render(
      await conn.query(
        `SELECT * FROM topics WHERE subject_id = ? AND id NOT IN (SELECT topic_id FROM publish_topics WHERE id = ? AND subject_id = ?)`,
        [subject_id, ctx.params.id, subject_id],
      ),
    );
  },

  async POST(req, ctx) {
    const form = await req.formData();
    const topic_id = form.get("topic_id");
    const subject_id = ctx.params.subject_id;
    const id = ctx.params.id;
    if (!topic_id) {
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
        "SELECT COUNT(id) as _count FROM publish_topics WHERE id = ? AND subject_id = ?",
        [id, subject_id],
      ) as { _count: number }[];

      await conn.execute(
        "INSERT INTO publish_topics(id, subject_id, topic_id, idx) VALUES(?,?,?,?)",
        [id, subject_id, topic_id, r[0]._count + 1],
      );
      return new Response("", {
        status: 303,
        headers: {
          location: `/publish/${id}/${subject_id}`,
          ["flash-message"]: "Topic added successfully",
        },
      });
    } catch (error) {
      console.error(error);
      return new Response("", {
        status: 303,
        headers: {
          location: `/publish/${id}/${subject_id}`,
          ["flash-message"]: "Failed to add topic",
        },
      });
    }
  },
};

export default function _(
  { data, params }: PageProps<ITopic[]>,
) {
  const selected = useSignal<ITopic | undefined>(undefined);

  return (
    <div class={"px-2"}>
      <form method={"POST"}>
        <div class={"py-8 mx-auto max-w-screen-md"}>
          <TopicSelector controller={selected} topics={data} />
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
