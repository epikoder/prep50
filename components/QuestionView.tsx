import { Signal, useSignal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import { assets } from "../libs/helper.ts";

const QuestionView = (
  { question, controller, is_selectable, style }: {
    question: Question;
    controller?: Signal<Record<string, string>>;
    is_selectable?: boolean;
    style?: JSX.HTMLAttributes["class"];
  },
) => {
  const is_passage_expanded = useSignal(false);
  const onChecked = (ev: JSX.TargetedEvent<HTMLInputElement>) => {
    if (!controller) return;
    const checked = ev.currentTarget.checked;
    if (checked) {
      controller.value[question.id.toString()] = question.id.toString();
    } else delete controller.value[question.id.toString()];
  };

  return (
    <div class={style ?? "p-4 rounded shadow-md space-x-2 flex w-full"}>
      {is_selectable && (
        <div>
          <input
            type="checkbox"
            checked={controller
              ? !!controller.value[question.id.toString()]
              : undefined}
            onChange={onChecked}
          />
        </div>
      )}
      <div class={"space-y-3"}>
        {question.question_details && (
          <div
            dangerouslySetInnerHTML={{ __html: question.question_details }}
          />
        )}
        {question.passage && (
          <div
            class={`cursor-pointer transition-all duration-200 ${
              is_passage_expanded.value
                ? ""
                : "line-clamp-4 overflow-ellipsis hover:line-clamp-none"
            }`}
            dangerouslySetInnerHTML={{
              __html: question.passage,
            }}
            onClick={() =>
              is_passage_expanded.value = !is_passage_expanded.value}
          />
        )}
        <div dangerouslySetInnerHTML={{ __html: question.question }} />
        {question.question_image && (
          <img src={assets(question.question_image)} />
        )}
        {question.question_type_id === "1" && (
          <div class={"space-y-2"}>
            <Option name="A" value={question.option_1} />
            <Option name="B" value={question.option_2} />
            <Option name="C" value={question.option_3} />
            <Option name="D" value={question.option_4} />
          </div>
        )}
        {question.question_type_id !== "1" && (
          <div>
            <div dangerouslySetInnerHTML={{ __html: question.full_answer }} />
          </div>
        )}
      </div>
    </div>
  );
};

const Option = ({ name, value }: { name: string; value: string }) => {
  return (
    <div class={"flex space-x-2"}>
      <span>[{name}]</span>
      <div dangerouslySetInnerHTML={{ __html: value }} />
    </div>
  );
};

export default QuestionView;
