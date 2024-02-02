import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";

export default function JumpPage(
  { lastPage, collection, query }: { lastPage: number; collection: string; query: string },
) {
  const value = useSignal(0);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div class={"flex justify-center py-2 text-xs"}>
      <div class={"flex space-x-2"}>
        <input
          ref={ref}
          class={"px-2 py-1 rounded-md border dark:text-gray-900"}
          placeholder={"enter page number"}
          type="number"
          onKeyUp={() => {
            const v = ref.current?.value;
            value.value = parseInt(v || "");
          }}
        />
        <button
          disabled={isNaN(value.value) || value.value > lastPage}
          class={"disabled:cursor-not-allowed disabled:bg-gray-400 border rounded-md p-2 hover:bg-black hover:text-white"}
          onClick={() => {
            location.assign(
              `/collections/${collection}?${query}&currentPage=${value.value}`,
            );
          }}
        >
          Go
        </button>
      </div>
    </div>
  );
}
