import Net from "../libs/net.ts";
import { showSuccess } from "../libs/toast.ts";
import PillButton from "./PillButton.tsx";
import { Signal } from "@preact/signals-core";

export default function PublishSaveButton<T extends { idx: number }>(
  { items, url, onComplete }: {
    items: Signal<T[]>;
    url: string;
    onComplete(): void;
  },
) {
  const save = async () => {
    await Net.instance.putReq(url, {
      data: items.value.map((v, idx) => ({ ...v, idx: idx + 1 })),
    });
    showSuccess("Updated successfully");
    onComplete();
  };

  return (
    <PillButton
      text="save"
      onClick={save}
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
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      }
    />
  );
}
