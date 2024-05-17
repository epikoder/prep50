import { Signal, useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { Fragment, JSX } from "preact/jsx-runtime";
import Nothing from "../../components/Nothing.tsx";
import Net from "../../libs/net.ts";
import PillButton from "../../components/PillButton.tsx";
import { showFailed, showSuccess } from "../../libs/toast.ts";
import { assets } from "../../libs/helper.ts";
import QuestionView from "../../components/QuestionView.tsx";

export default function QuestionSelector(
  { controller, questions }: {
    controller: Signal<Record<string, string>>;
    questions: Question[];
  },
) {
  const search = useSignal<string>("");
  const is_loading = useSignal(false);
  const ref = useRef<HTMLInputElement>(null);
  const to_string = (opt: Question): string => opt.question;

  const matcher = (opt: Question, cmp: string): boolean => {
    return to_string(opt).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").match(
      new RegExp(
        cmp.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      ),
    ) != null;
  };

  const handler = (e: KeyboardEvent): void => {
    if (e.code == "Slash") {
      if (ref.current != document.activeElement) e.preventDefault();
      ref.current?.focus();
    }
  };

  const onSearchShortcut = () => {
    globalThis.addEventListener("keypress", handler);
  };

  const onFocusHandler = () => {
    globalThis.removeEventListener("keypress", handler, {});
  };

  const onSubmit = async (ev: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
    ev.preventDefault();
    is_loading.value = true;
    console.log(controller.value);
    const res = await Net.instance.postReq<Api>(
      globalThis.location.pathname,
      controller.value,
    );
    if (res.Err || res.Ok?.status == "failed") {
      showFailed(res.Ok?.$meta?.message ?? "Failed to save");
    } else {
      showSuccess(res.Ok!.$meta!.message);
    }
    setTimeout(() => {
      is_loading.value = false;
      if (res.Ok?.status == "success") {
        location.replace(location.pathname.replace("/update", ""));
      }
    }, 1000);
  };

  useEffect(() => {
    if (typeof window == "undefined") return;
    onSearchShortcut();
  });

  return (
    <form method={"POST"} onSubmit={onSubmit}>
      <div class={"max-w-screen-lg mx-auto pt-4 items-center"}>
        <input
          value={search.value}
          onInput={(ev) => search.value = ev.currentTarget.value}
          class={"border rounded-md px-3 py-1"}
          ref={ref}
          onBlur={onSearchShortcut}
          onFocus={onFocusHandler}
          placeholder={"Type `/` to search"}
        />
        <div
          class={"min-h-24 max-h-[70vh] overflow-y-scroll p-2 my-2 border rounded-md"}
        >
          {questions.filter((q) => !search.value || matcher(q, search.value))
            .map(
              (q) => (
                <QuestionView
                  controller={controller}
                  question={q}
                  is_selectable
                />
              ),
            )}
          {questions.filter((q) => !search.value || matcher(q, search.value))
                .length == 0 && <Nothing text="No match" />}
        </div>
      </div>
      <PillButton
        text="Save"
        disabled={is_loading.value}
        iconData={is_loading.value
          ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 animate-spin"
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
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          )}
      />
    </form>
  );
}
