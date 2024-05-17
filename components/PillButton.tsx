import { JSX } from "preact/jsx-runtime";
export default function PillButton(
  { text, iconData, status = "normal", ...props }:
    & { text: string; iconData: JSX.Element; status?: "normal" | "danger" }
    & JSX.HTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button
      {...props}
      class={`rounded-md ${
        status == "danger" ? "bg-red-500" : "bg-[#46b5ff]"
      } w-48 hover:bg-opacity-95 disabled:bg-opacity-50 active:bg-opacity-70 transition-all duration-300 flex justify-center space-x-2 items-center text-white shadow-md mx-auto px-4 mt-4`}
    >
      <div class={"uppercase text-xs bold"}>
        {text}
      </div>
      {iconData}
    </button>
  );
}
