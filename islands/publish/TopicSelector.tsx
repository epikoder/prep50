import { Selector } from "../Select.tsx";
import { Signal } from "@preact/signals";
import { Fragment } from "preact/jsx-runtime";

export default function TopicSelector(
  { controller, topics }: {
    controller: Signal<ITopic | undefined>;
    topics: ITopic[];
  },
) {
  return (
    <Fragment>
      <Selector
        onOptionSelected={(opt) => controller.value = opt}
        options={topics}
        to_string={(v) => v!.title}
        selected={controller.value}
        placeholder="Select topic"
        render={(v) => <span dangerouslySetInnerHTML={{ __html: v!.title }} />}
      />
      <input hidden name={"topic_id"} value={controller.value?.id} />
    </Fragment>
  );
}
