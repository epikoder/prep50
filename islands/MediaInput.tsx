import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import { assets } from "../libs/helper.ts";

interface MediaInputProps {
  attribute: Attributes & MediaAttribute;
  value: string;
}

export default function MediaInput(
  { attribute, value: defaultValue }: MediaInputProps,
) {
  const isActive = useSignal(true);
  const value = useSignal(defaultValue);
  const preview = useSignal<string | undefined>(undefined);

  const ref = useRef<HTMLInputElement>(null);
  const _onClick = () => {
    if (isActive.value) ref.current?.click();
  };

  const limit = attribute.type == "image"
    ? 2
    : attribute.type === "file"
    ? 3
    : 10;

  function _onChange() {
    const uploader = ref.current;

    if (uploader!.files![0].size > 1048576 * limit) {
      alert("File is larger than 2mb!");
      uploader!.value = "";
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      return preview.value = e.target?.result as string;
    };

    if (uploader !== null) {
      reader.readAsDataURL(uploader!.files![0]);
    }
  }

  const _delete = () => {
    preview.value = "";
    value.value = "";
  };

  const _view = () => {
    let mc = document.getElementById("modal_view");
    if (!mc) {
      mc = document.createElement("div");
      mc.id = "modal_view";
      mc.style.position = "absolute";
      mc.style.top = "0px";
      mc.style.bottom = "0px";
      mc.style.left = "0px";
      mc.style.right = "0px";
      mc.style.zIndex = "10";
      mc.style.flexDirection = "column";
      mc.style.justifyContent = "center";
      mc.style.alignItems = "center";
      mc.style.display = "none";
      mc.style.background = "color(srgb 0.97 0.97 0.97 / 0.07)";
      mc.style.padding = "100px";
      mc.addEventListener("click", function (e) {
        this.style.display = "none";
      });
      mc.addEventListener("keydown", function (e) {
        console.log(e);
      });
      document.body.append(mc);
    }
    const img = document.createElement("img");
    img.src = value ? assets(value.value) : preview.value || "";

    mc!.innerHTML = "";
    mc!.appendChild(img);
    mc!.style.display = "flex";
  };

  return (
    <>
      <div
        class={`h-40 w-48  flex flex-col justify-center items-center border rounded-md text-gray-700 dark:text-gray-300 bg-no-repeat bg-cover ${
          isActive.value ? "cursor-pointer" : ""
        }${!isActive.value ? "cursor-not-allowed" : ""}`}
        style={{
          backgroundImage: preview.value
            ? `url(${preview.value})`
            : value
            ? `url(${assets(value.value)})`
            : undefined,
        }}
        disabled={!isActive.value}
        onClick={preview.value || value.value ? undefined : _onClick}
      >
        {!preview.value && !value.value && `Select ${attribute.type}`}
        {(preview.value || value.value) && (
          <div class="flex justify-center items-center flex-col w-full h-full">
            <div class={"space-x-2 flex"}>
              <div
                class={"p-1 hover:text-red-500 hover:bg-gray-400 bg-opacity-60 rounded-md"}
                onClick={_delete}
              >
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
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </div>
              {(value && attribute.type === "image") && (
                <div
                  class={"p-1 hover:text-blue-500 hover:bg-gray-400 bg-opacity-60 rounded-md"}
                  onClick={_view}
                >
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
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {(value.value && ref.current) && (
        <div>
          {console.log(ref.current.files)}
          {ref.current.files!.length > 0 && ref.current!.files![0].name}
        </div>
      )}
      <input
        name={attribute.field}
        placeholder={attribute.displayName || attribute.field}
        class={"placeholder:lowercase"}
        type={"file"}
        onChange={_onChange}
        accept={`${attribute.type}/*`}
        hidden
        ref={ref}
      />
      {
        /* <div class="flex py-3">
        <div class="flex space-x-2 px-4 py-2 text-sm cursor-pointer border rounded-md shadow-md">
          <div>
            {"Open Gallery"}
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
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
      </div> */
      }
    </>
  );
}
