import { Handler, PageProps } from "$fresh/server.ts";
import CreatePublish from "../../islands/publish/CreatePublsih.tsx";
import Builder from "../../libs/builder.ts";

export const handler: Handler = async (_, ctx) => {
  const subjects = await (await Builder.getConnection()).query(
    "SELECT * FROM subjects",
  );
  return ctx.render(subjects);
};
export default function _({ data }: PageProps) {
  return (
    <div>
      <div>
        <div class={"p-8 bg-[#eee] rounded-md text-center"}>
          {"Create a new walkthrough"}
        </div>
      </div>
      <div class={"flex flex-col items-center space-y-2 p-4"} f-client-nav>
        <CreatePublish subjects={data} />
      </div>
    </div>
  );
}
