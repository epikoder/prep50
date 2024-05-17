import { Selector } from "../../components/Select.tsx";
import { Signal } from "@preact/signals";
import { Fragment } from "preact/jsx-runtime";

export default function SubTopicSelector(
  { controller, sub_topics }: {
    controller: Signal<ISubTopic | undefined>;
    sub_topics: ISubTopic[];
  },
) {
  return (
    <Fragment>
      <Selector
        onOptionSelected={(opt) => controller.value = opt}
        options={sub_topics}
        to_string={(v) => v!.title}
        selected={controller.value}
        placeholder="Select sub-topic"
        render={(v) => <span dangerouslySetInnerHTML={{ __html: v!.title }} />}
      />
      <input hidden name={"sub_topic_id"} value={controller.value?.id} />
    </Fragment>
  );
}
