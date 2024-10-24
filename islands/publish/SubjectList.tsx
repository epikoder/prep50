import { Signal, useComputed, useSignal } from "@preact/signals";
import { Fragment, JSX } from "preact/jsx-runtime";
import Draggable from "../../components/Draggable.tsx";
import List from "../../components/List.tsx";
import LinkButton from "../../components/LinkButton.tsx";
import PublishSaveButton from "../../components/PublishSaveButton.tsx";
import { showFailed } from "../../libs/toast.ts";
import PublishDeleteButton from "../../components/PublishDeleteButton.tsx";
import PillButton from "../../components/PillButton.tsx";
import Net from "../../libs/net.ts";
import { useEffect, useRef } from "preact/hooks";
import { render, VNode } from "preact";
import { assets } from "../../libs/helper.ts";
interface SUB {
  name: string;
  topics: TOP[];
}
interface TOP {
  title: string;
  details: string;
  sub_topics: SUBTOPIC[];
}
interface SUBTOPIC {
  title: string;
  details: string;
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
  { items, id, title }: {
    items: ISubject[];
    id: string;
    title: string;
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
          text={`Walkthrough ${is_marked_for_delete_mutated.value
            ? "( " + (deletion_list.value as T[]).length + " )"
            : ""
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
      <DownloadDocx id={id} title={title} />
    </div>
  );
}

const img2base64 = async (uri: string): Promise<string> => {
  const reader = new FileReader();
  reader.readAsDataURL(await (await fetch(uri)).blob());
  return new Promise((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
  });
};

const Option = ({ option, value }: { option: string; value: string }) => (
  <span style={{ whiteSpace: "no-wrap" }}>
    <span style={{ fontWeight: "bold" }}>
      {option}.&nbsp;
    </span>
    <span
      dangerouslySetInnerHTML={{
        __html: (value.at(0)?.toUpperCase() ?? "") + value.slice(1),
      }}
    />
  </span>
);

const DownloadDocx = ({ id, title }: { id: string; title: string }) => {
  const doc = useSignal<SUB[]>([]);
  const is_loading = useSignal(false);

  const ref = useRef<HTMLIFrameElement>(null);
  const download_ref = useRef<HTMLAnchorElement>(null);

  const download = (buffer: ArrayBuffer) => {
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const _title = `${title.replace(" ", "-")}.docx`;
    if (isSafari) {
      // For Safari, open the URL in a new window/tab to trigger the download
      const newWindow = globalThis.open(url, "_blank");
      if (newWindow) {
        newWindow.document.title = _title;
      }
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 20000);
      is_loading.value = false;
    } else {
      download_ref.current!.href = url;
      download_ref.current!.download = _title;
      download_ref.current!.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        is_loading.value = false;
      }, 1000);
    }
  };

  const generate_docx = (sections: VNode[]) => {
    if (!ref.current) {
      alert("Noting to print")
      return is_loading.value = false
    };
    ref.current!.style.zIndex = "9999999999";
    ref.current!.style.position = "fixed";
    ref.current!.style.top = "-999999px";
    ref.current!.style.height = "297mm";
    ref.current!.style.width = "210mm";
    ref.current!.style.backgroundColor = "white";

    ref.current!.contentDocument!.body.innerHTML = "";
    ref.current!.contentDocument!.body.append(
      ...sections.map((a) => {
        const container = document.createElement("div");
        render(a, container);
        return container.firstChild!;
      }),
    );

    setTimeout(async () => {
      const html = ref.current!.contentDocument!.body
        .innerHTML;
      try {
        const res = await fetch(
          Net.instance.url + "/api/publish/print",
          {
            body: JSON.stringify({ html }),
            method: "POST",
          },
        );
        const buffer = await res.arrayBuffer();
        download(buffer);
      } catch (error) {
        console.error(error);
        is_loading.value = false;
      }
    }, 2000);
  };

  const build_jsx = async () => {
    const sections: VNode[] = [];
    for (const sub of doc.value) {
      sections.push(
        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            textTransform: "uppercase",
            lineHeight: 1.5,
            fontSize: "18px",
          }}
        >
          {sub.name}
        </p>,
      );
      for (const topic of sub.topics) {
        sections.push(
          <p
            style={{
              textAlign: "center",
              fontWeight: "bold",
              lineHeight: 1.1,
              fontSize: "15px",
            }}
          >
            {topic.title}
          </p>,
          <p
            style={{ textAlign: "left", fontWeight: "bold", fontSize: "10px" }}
          >
            {topic.details}
          </p>,
        );
        for (const sub_topic of topic.sub_topics) {
          sections.push(
            <p
              style={{
                fontWeight: "bold",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              {sub_topic.title}
            </p>,
            <p
              style={{
                fontWeight: "bold",
                fontSize: "10px",
              }}
            >
              {sub_topic.details}
            </p>,
            <p></p>,
          );
          const qsec: VNode[] = [];
          for (let i = 0; i < sub_topic.questions.length; i++) {
            const qx = sub_topic.questions[i];
            qsec.push(
              <li>
                <p style={{ fontSize: "10px" }}>
                  {qx.question_details && (
                    <Fragment>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: qx.question_details,
                        }}
                      />
                      <br />
                    </Fragment>
                  )}
                  {qx.passage && (
                    <Fragment>
                      <span dangerouslySetInnerHTML={{ __html: qx.passage }} />
                      <br />
                    </Fragment>
                  )}
                  <span
                    style={{ fontWeight: "bold" }}
                    dangerouslySetInnerHTML={{ __html: qx.question }}
                  />
                  {qx.question_image && (
                    <Fragment>
                      <img
                        src={await img2base64(assets(qx.question_image))}
                        height={120}
                        width={80}
                      />
                      <br />
                    </Fragment>
                  )}

                  <br />
                  <Option option="A" value={qx.option_1} />&nbsp;
                  <Option option="B" value={qx.option_2} />&nbsp;
                  <Option option="C" value={qx.option_3} />&nbsp;
                  <Option option="D" value={qx.option_4} />
                </p>
              </li>,
            );
          }
          sections.push(
            <ol
              data-start="1"
              style={{
                fontSize: "10px",
                listStyleType: "decimal",
                listStylePosition: "outside",
                paddingInlineStart: 0,
                marginInlineStart: 0,
              }}
            >
              {qsec.map((a) => a)}
            </ol>,
          );
          sections.push(
            <p />,
          );
          sections.push(
            <p style={{ fontWeight: "bold" }}>{sub_topic.title}&nbsp;Answer</p>,
          );
          sections.push(
            <p>
              {sub_topic.questions.map((a, i) => (
                <Fragment>
                  <Option
                    option={(i + 1).toString()}
                    value={a.short_answer == "option_1"
                      ? "A"
                      : a.short_answer == "option_2"
                        ? "B"
                        : a.short_answer == "option_3"
                          ? "C"
                          : "D"}
                  />&nbsp;&nbsp;
                </Fragment>
              ))}
            </p>,
          );
        }
      }
      sections.push(<div class={"page-break"} />);
    }
    generate_docx(sections);
  };

  const _print = async () => {
    is_loading.value = true;
    const result = await Net.instance.getReq<Api<SUB[]>>(
      "/api/publish/print?id=" + id,
    );
    if (result.Err || result.Ok?.status == "failed") {
      is_loading.value = false;
      return showFailed("Unexpected Error occured");
    }

    doc.value = result.Ok!.data!;
    setTimeout(() => {
      build_jsx();
    }, 500);
  };

  return (
    <Fragment>
      <PillButton
        text="Print"
        disabled={is_loading.value}
        iconData={is_loading.value
          ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 p-1 animate-spin"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          )
          : (
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
          )}
        onClick={() => _print()}
      />
      {doc.value.length > 0 && <iframe ref={ref} />}
      <a id={"downloadx"} ref={download_ref} style={{ display: "none" }} />
    </Fragment>
  );
};
