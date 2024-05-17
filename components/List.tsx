import { useComputed, useSignal } from "@preact/signals";
import Draggable from "./Draggable.tsx";
import { JSX } from "preact/jsx-runtime";

export default function List<T>(
  { items, render, onMutated }: {
    items: T[];
    render: (_: T, __: number) => JSX.Element;
    onMutated(_: boolean, __: T[]): void;
  },
) {
  const list = useSignal(items);

  const updateList = (updated_list: T[]) => {
    list.value = updated_list;

    for (let i = 0; i < items.length; i++) {
      if (updated_list[i] !== items[i]) {
        return onMutated(true, updated_list);
      }
    }
    onMutated(false, updated_list);
  };

  return (
    <div class={"w-full h-full max-h-[80vh] overflow-scroll"}>
      <Draggable
        items={list.value}
        onDragComplete={updateList}
      >
        {render}
      </Draggable>
    </div>
  );
}
