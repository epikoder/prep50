import { useEffect } from "preact/hooks";
import Net from "../../libs/net.ts";
import { useSignal } from "@preact/signals";
import { showFailed } from "../../libs/toast.ts";
import Loader from "../../components/Loader.tsx";
import QuestionView from "../../components/QuestionView.tsx";

type T = UntypedQuestion & ObjectiveQuestion & {
  subject_id: number;
  idx: number;
  p_id: string;
  p_title: string;
  s_name: string;
  s_idx: number;
  t_title: string;
  t_idx: number;
  sub_title: string;
  sub_idx: number;
};

export default function Walkthrough(
  { id, subjectId }: { id: string; subjectId: string[] },
) {
  const questions = useSignal<T[]>([]);
  const is_loading = useSignal<boolean>(true);
  const current_question = useSignal<number>(0);

  const onNext = () => {
    if (current_question.value < questions.value.length - 1) {
      current_question.value += 1;
    }
  };
  const onPrev = () => {
    if (current_question.value > 0) {
      current_question.value -= 1;
    }
  };

  useEffect(() => {
    (async () => {
      const res = await Net.instance.postReq<Api<T[]>>(
        "/api/publish/walkthrough",
        {
          id,
          subject_id: subjectId,
        },
      );
      if (res.Err || res.Ok?.status == "failed") {
        return showFailed("An unexpected error occured", {
          duration: 5000,
        });
      }

      const v = res.Ok!.data!;
      for (let i = 0; i < v.length - 1; i++) {
        if (i == 0) {
          v[i].idx = 1;
        }
        if (v[i].subject_id != v[i + 1].subject_id) {
          v[i + 1].idx = 1;
        } else {
          v[i + 1].idx = v[i].idx + 1;
        }
      }
      is_loading.value = false;
      questions.value = v;
    })();
  }, []);

  return (
    <div>
      <div
        class={"min-h-[10rem] flex flex-col justify-center max-w-screen-lg mx-auto"}
      >
        <Loader loading={is_loading.value} />
        {questions.value.length > 0 && (
          <View
            question={questions.value.at(current_question.value)!}
            on_next={onNext}
            on_prev={onPrev}
          />
        )}
      </div>
      <div class={"max-w-screen-lg mx-auto"}>
        <div class={"flex flex-wrap justify-center"}>
          {questions.value.map((v, index) => (
            <div
              class={`px-3 py-1 border max-w-fit cursor-pointer hover:bg-blue-500 hover:bg-opacity-75 hover:text-white ${
                current_question.value == index ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => current_question.value = index}
            >
              {v.idx}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const View = (
  { question, on_next, on_prev }: {
    question: T;
    on_next?: VoidFunction;
    on_prev?: VoidFunction;
  },
) => {
  const is_answer_visible = useSignal(false);
  const on_answer = () => is_answer_visible.value = !is_answer_visible.value;

  const on_navigate = (cb?: VoidFunction) => {
    if (is_answer_visible.value) is_answer_visible.value = false;
    if (cb) cb();
  };
  return (
    <div>
      <div>
        <span>
          Subject:&nbsp;
        </span>
        <span class={"font-bold"}>
          {question.s_name}
        </span>
      </div>
      <div>
        <span>
          Topic:&nbsp;
        </span>
        <span
          class={"font-semibold"}
          dangerouslySetInnerHTML={{ __html: question.t_title }}
        />
      </div>
      <div>
        <span>
          Sub Topic:&nbsp;
        </span>
        <span dangerouslySetInnerHTML={{ __html: question.sub_title }} />
      </div>

      <QuestionView
        question={question}
        style={"p-4 rounded space-x-2 flex w-full"}
      />
      <div
        hidden={!is_answer_visible.value}
        class={"max-h-[50v] overflow-y-scroll space-y-4"}
      >
        <div
          class={"text-center flex items-center space-x-2"}
        >
          <span>
            {"Correct Answer = "}
          </span>
          <span
            dangerouslySetInnerHTML={{ __html: answer(question.short_answer!) }}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 p-1 text-[#46b5ff]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        {question.answer_details && (
          <div>
            <div class={"font-semibold text-center"}>
              {"Explanation"}
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: question.answer_details }}
            />
          </div>
        )}
      </div>
      <div class={"flex justify-between px-4 py-8"}>
        <button onClick={() => on_navigate(on_prev)} class={"flex space-x-4"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18"
            />
          </svg>
          <div>
            {"Prev"}
          </div>
        </button>

        <button onClick={on_answer} class={"flex space-x-4"}>
          <div
            class={"w-32 rounded-lg py-2 text-white bg-[#46b5ff] hover:bg-opacity-75"}
          >
            {is_answer_visible.value ? "Hide Answeer" : "Show Answer"}
          </div>
        </button>

        <button onClick={() => on_navigate(on_next)} class={"flex space-x-4"}>
          <div>
            {"Next"}
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const answer = (ans: Answer) =>
  ans == "option_1"
    ? "A"
    : ans == "option_2"
    ? "B"
    : ans == "option_3"
    ? "C"
    : "D";
