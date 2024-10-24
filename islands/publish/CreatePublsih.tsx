import { useComputed, useSignal } from "@preact/signals";
import Net from "../../libs/net.ts";
import { Fragment } from "preact/jsx-runtime";
import SubjectSelector from "./SubjectSelector.tsx";

export default function CreatePublish({ subjects }: { subjects: ISubject[] }) {
  const selected = useSignal<ISubject | undefined>(undefined);
  const title = useSignal<string>("");

  const is_typing = useSignal(false);
  const is_title_valid = useComputed(() => title.value.trim().length > 5);

  const save = async () => {
    if (!is_title_valid.value || !selected.value) return;
    const result = await Net.instance.postReq<Api>("/api/publish", {
      subject: selected.value!.id,
      title: title.value,
    });
    if (result.Err || result.Ok!.status == "failed") return; //notify
    location.replace("/publish/" + (result.Ok!.data!.id as string));
  };

  return (
    <Fragment>
      <div>
        <input
          placeholder={"What should I name this.."}
          class={"outline-none focus:outline-none rounded p-2 border w-80"}
          value={title.value}
          onChange={(e) =>
            title.value = (e.target as HTMLInputElement).value.trim()}
          onFocus={() => is_typing.value = true}
          onfocusout={() => is_typing.value = false}
        />
        {!is_title_valid.value && (
          <div class={"text-right text-xs italic text-red-500"}>
            {"lenght should be at least 5"}
          </div>
        )}
      </div>
      <div class={"w-80"}>
        <SubjectSelector controller={selected} subjects={subjects} />
      </div>
      <div class={"flex w-80 justify-end py-8"}>
        <button
          class={"border border-black bg-white hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-500 transition-all duration-300 p-2 text-xs uppercase"}
          disabled={!is_title_valid.value || !selected.value || is_typing.value}
          onClick={save}
        >
          Continue
        </button>
      </div>
    </Fragment>
  );
}
