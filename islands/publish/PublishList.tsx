import { useEffect } from "preact/hooks";
import Net from "../../libs/net.ts";
import { useSignal } from "@preact/signals";
import Nothing from "../../components/Nothing.tsx";

type IPublishWithSubjectCount = IPublish & { subject_count: number };
export default function PublishList() {
  const publishes = useSignal<IPublishWithSubjectCount[]>([]);
  const is_loading = useSignal<boolean>(true);

  const _delete = async (id: string) => {
    await Net.instance.putReq("/api/publish", {
      data: id,
      action: "delete",
    });
    location.reload();
  };

  useEffect(() => {
    const _ = async () => {
      const res = await Net.instance.getReq<Api<IPublishWithSubjectCount[]>>(
        "/api/publish",
        {
          credentials: "include",
        },
      );
      is_loading.value = false;
      if (res.Err || res.Ok!.status == "failed") {
        return console.log(res.Err);
      }
      publishes.value = res.Ok!.data!;
    };
    _();
  }, []);

  return (
    <div class={"flex flex-col items-center py-4 w-full"}>
      {is_loading.value && [1, 2, 3].map(() => (
        <div class={"flex space-x-2"}>
          <div class={"lines shine h-8 my-2 w-12 rounded-md"} />
          <div class={"lines shine h-8 my-2 w-72 rounded-md"} />
        </div>
      ))}
      {(publishes.value.length == 0 && !is_loading.value) && <Nothing />}
      {publishes.value.length > 0 && (
        <div class={"max-w-lg w-full px-2 space-y-2"}>
          <div class={"flex justify-between text-xs uppercase text-gray-600"}>
            <span>
              {"title"}
            </span>
            <span>
              {"subjects"}
            </span>
          </div>
          {publishes.value.map((p: IPublishWithSubjectCount) => (
            <div class={"flex space-x-2 w-full items-center"}>
              <a href={`/publish/${p.id}`} class={"w-full"}>
                <div
                  class={"flex justify-between px-2 py-1 my-2 rounded shadow bg-[#46b5ff] hover:bg-opacity-75 transition-all duration-300 text-white text-sm w-full"}
                >
                  <div>
                    {p.title}
                  </div>
                  <div>
                    {p.subject_count}
                  </div>
                </div>
              </a>
              <button
                class={"text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-all duration-300"}
                onClick={() =>
                  _delete(p.id)}
              >
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
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
