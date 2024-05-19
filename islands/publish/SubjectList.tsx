import { Signal, useComputed, useSignal } from "@preact/signals";
import { Fragment, JSX } from "preact/jsx-runtime";
import Draggable from "../../components/Draggable.tsx";
import List from "../../components/List.tsx";
import LinkButton from "../../components/LinkButton.tsx";
import PublishSaveButton from "../../components/PublishSaveButton.tsx";
import { showSuccess } from "../../libs/toast.ts";
import {} from "npm:docx";
import PublishDeleteButton from "../../components/PublishDeleteButton.tsx";
import PillButton from "../../components/PillButton.tsx";
import Net from "../../libs/net.ts";
import { useEffect, useRef } from "preact/hooks";
import { render, VNode } from "preact";

interface SUB {
  name: string;
  topics: TOP[];
}
interface TOP {
  title: string;
  sub_topics: SUBTOPIC[];
}
interface SUBTOPIC {
  title: string;
  questions: V[];
}

type Q = UntypedQuestion & ObjectiveQuestion;
type V = Q & {
  subject_id: number;
  idx: number;
  p_id: string;
  p_title: string;
  s_name: string;
  s_idx: number;
  topic_id: number;
  t_title: string;
  t_idx: number;
  sub_topic_id: number;
  sub_title: string;
  sub_idx: number;
};

type T = ISubject & { id: string };
export default function SubjectList(
  { items, id }: {
    items: ISubject[];
    id: string;
  },
) {
  const is_mutated = useSignal<boolean>(false);
  const mutated_list = useSignal<T[]>([]);
  const is_marked_for_delete_mutated = useSignal<boolean>(false);
  const deletion_list = useSignal<T[]>([]);

  const doc = useSignal<SUB[]>([]);

  const onSelectForDelete = (
    ev: JSX.TargetedEvent<HTMLInputElement>,
    qx: T,
  ) => {
    const checked = ev.currentTarget.checked;
    if (checked) {
      deletion_list.value = deletion_list.value.concat(qx);
    } else {
      const index = deletion_list.value.findIndex((e: T) =>
        qx.subject_id == e.subject_id
      );
      if (index > -1) {
        deletion_list.value = deletion_list.value.slice(0, index).concat(
          deletion_list.value.slice(index + 1),
        );
      }
    }
    is_marked_for_delete_mutated.value = deletion_list.value.length > 0;
  };

  const _print = async () => {
    const result = await Net.instance.getReq<Api<SUB[]>>(
      "/api/publish/print?id=" + id,
    );
    if (result.Err || result.Ok?.status == "failed") {
      return;
    }

    doc.value = result.Ok!.data!;
  };

  // useEffect(() => {
  //   _print();
  // }, []);

  return (
    <div class={"space-y-3"}>
      <List
        items={items}
        onMutated={(state, value): void => {
          mutated_list.value = value;
          is_mutated.value = state;
        }}
        render={(subject, index) => (
          <div class={"w-full flex space-x-2"}>
            <div class={"space-y-1"}>
              <div>
                {index + 1}
              </div>
              <input
                type={"checkbox"}
                onChange={(ev) => onSelectForDelete(ev, subject)}
              />
            </div>
            <a href={`/publish/${id}/${subject.subject_id}`} class={"w-full"}>
              <div
                class={"py-2 shadow-md rounded px-4 flex justify-between group transition-all duration-300 hover:shadow-lg cursor-pointer"}
              >
                <div class={"group-hover:text-[#46b5ff]"}>
                  {subject.name}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 group-hover:text-[#46b5ff]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                  />
                </svg>
              </div>
            </a>
          </div>
        )}
      />
      {is_mutated.value && (
        <PublishSaveButton
          items={mutated_list}
          url="/api/publish/subject"
          onComplete={() => is_mutated.value = false}
        />
      )}
      {is_marked_for_delete_mutated.value && (
        <PublishDeleteButton
          items={deletion_list}
          url="/api/publish/subject"
          onComplete={() => location.reload()}
        />
      )}

      <LinkButton
        text="Add Subject"
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
        url={"/publish/update/" + id}
      />
      <div>
        <LinkButton
          text={`Walkthrough ${
            is_marked_for_delete_mutated.value
              ? "( " + (deletion_list.value as T[]).length + " )"
              : "All"
          }`}
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
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
              />
            </svg>
          }
          url={"/publish/walkthrough/" + id + "?" +
            (is_marked_for_delete_mutated.value
              ? (
                deletion_list.value.map((s) => "subject_id=" + s.subject_id)
                  .join("&")
              )
              : "")}
        />
        {is_marked_for_delete_mutated.value && (
          <div class={"py-1 text-xs italic text-center"}>
            {deletion_list.value.map((v: T) =>
              v.name
            ).join(", ")}
          </div>
        )}
      </div>
      <PillButton
        text="Print"
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
              d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
            />
          </svg>
        }
        onClick={() => _print()}
      />
      <DownloadDocx doc={doc} id={id} />
    </div>
  );
}

const DownloadDocx = ({ doc, id }: { doc: Signal<SUB[]>; id: string }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const sections: VNode[] = [];
  for (const sub of doc.value) {
    sections.push(<p>{sub.name}</p>);
    for (const topic of sub.topics) {
      sections.push(<p>{topic.title}</p>);
      for (const sub_topic of topic.sub_topics) {
        sections.push(<p>{sub_topic.title}</p>);
        const qsec: VNode[] = [];
        for (const qx of sub_topic.questions) {
          qsec.push(
            <p>
              <p dangerouslySetInnerHTML={{ __html: qx.question }} />
              <p dangerouslySetInnerHTML={{ __html: qx.option_1 }} />
              <p dangerouslySetInnerHTML={{ __html: qx.option_2 }} />
              <p dangerouslySetInnerHTML={{ __html: qx.option_3 }} />
              <p dangerouslySetInnerHTML={{ __html: qx.option_4 }} />
            </p>,
          );
        }
        sections.push(
          <div>
            {qsec}
          </div>,
        );
      }
    }
    sections.push(<div class={"page-break"} />);
  }

  useEffect(() => {
    if (typeof globalThis == "undefined" || !ref.current) return;
    ref.current!.style.zIndex = "9999999999";
    ref.current!.style.position = "fixed";
    // ref.current!.style.left = "0";
    // ref.current!.style.right = "0";
    // ref.current!.style.bottom = "0";
    ref.current!.style.top = "-999999px";
    ref.current!.style.height = "297mm";
    ref.current!.style.width = "210mm";
    // ref.current!.style.marginLeft = "auto";
    // ref.current!.style.marginRight = "auto";
    ref.current!.style.backgroundColor = "white";

    ref.current!.contentDocument!.getElementsByTagName("body")[0].append(
      ...sections.map((a) => {
        const container = document.createElement("div");
        render(a, container);
        console.log(a);
        return container.firstChild!;
      }),
    );

    setTimeout(() => {
      console.log(ref.current!.contentDocument!.getElementsByTagName("body"));
      const html = ref.current!.contentDocument!.getElementsByTagName("body")[0]
        .innerHTML;
      Net.instance.postReq("/api/publish/print?id=" + id, {
        html,
      });
    }, 2000);
  }, [sections]);

  return (
    <Fragment>
      {doc.value.length > 0 && <iframe ref={ref} />}
    </Fragment>
  );
};
