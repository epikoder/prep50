import { Selector } from "../../components/Select.tsx";
import { Signal } from "@preact/signals";
import { Fragment } from "preact/jsx-runtime";

export default function SubjectSelector(
  { controller, subjects }: {
    controller: Signal<ISubject | undefined>;
    subjects: ISubject[];
  },
) {
  return (
    <Fragment>
      <Selector
        onOptionSelected={(opt) => controller.value = opt}
        options={subjects}
        to_string={(v) => v!.name}
        selected={controller.value}
        placeholder="Select subject"
        render={(v) => <span dangerouslySetInnerHTML={{ __html: v!.name }} />}
      />
      <input hidden name={"subject_id"} value={controller.value?.id} />
    </Fragment>
  );
}
