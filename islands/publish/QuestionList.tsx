import { Signal, useComputed, useSignal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import Draggable from "../../components/Draggable.tsx";
import List from "../../components/List.tsx";
import LinkButton from "../../components/LinkButton.tsx";
import PublishSaveButton from "../../components/PublishSaveButton.tsx";
import { showSuccess } from "../../libs/toast.ts";
import Nothing from "../../components/Nothing.tsx";
import QuestionView from "../../components/QuestionView.tsx";
import PublishDeleteButton from "../../components/PublishDeleteButton.tsx";

type T = IQuestion & { id: string };
export default function QuestionList(
  { items, id, subject_id, topic_id, sub_topic_id }: {
    items: (IQuestion & { question: Question })[];
    id: string;
    subject_id: number;
    topic_id: number;
    sub_topic_id: number;
  },
) {
  const is_mutated = useSignal<boolean>(false);
  const mutated_list = useSignal<T[]>([]);
  const is_marked_for_delete_mutated = useSignal<boolean>(false);
  const deletion_list = useSignal<T[]>([]);

  const onSelectForDelete = (
    ev: JSX.TargetedEvent<HTMLInputElement>,
    qx: T,
  ) => {
    const checked = ev.currentTarget.checked;
    if (checked) {
      deletion_list.value.push(qx);
    } else {
      deletion_list.value.splice(
        deletion_list.value.findIndex((e: T) =>
          qx.question_id == e.question_id
        ),
      );
    }
    is_marked_for_delete_mutated.value = deletion_list.value.length > 0;
  };

  return (
    <div class={"space-y-3"}>
      {items.length == 0 && <Nothing />}
      <List
        items={items}
        onMutated={(state, value): void => {
          mutated_list.value = value.map((v) => ({ ...v, id }));
          is_mutated.value = state;
        }}
        render={(qx, index) => (
          <div class={"flex space-x-2"}>
            <div class={"space-y-1"}>
              <div>
                {index + 1}
              </div>
              <input
                type={"checkbox"}
                onChange={(ev) => onSelectForDelete(ev, qx)}
              />
            </div>
            <QuestionView question={qx.question} />
          </div>
        )}
      />
      {is_mutated.value && (
        <PublishSaveButton
          items={mutated_list}
          url="/api/publish/question"
          onComplete={() => is_mutated.value = false}
        />
      )}
      {is_marked_for_delete_mutated.value && (
        <PublishDeleteButton
          items={deletion_list}
          url="/api/publish/question"
          onComplete={() => location.reload()}
        />
      )}

      <LinkButton
        text="Add Question"
        icon={
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
              d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        }
        url={`/publish/update/${id}/${subject_id}/${topic_id}/${sub_topic_id}`}
      />
    </div>
  );
}
