import { useEffect, useRef } from "preact/hooks";
import MediaInput from "./MediaInput.tsx";
import QUILL, { QuillOptions } from "npm:quill@2.0.2";
import { useSignal } from "@preact/signals";

interface InputProps {
  attribute: SchemaAttribute;
  // deno-lint-ignore no-explicit-any
  data: Record<string, any>;
}
export default function Input({ attribute, data }: InputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const quillRef = useRef<HTMLDivElement>(null);
  const quill = useSignal<QUILL | null>(null);

  const isReady = useSignal(false);

  useEffect(() => {
    if (
      attribute.type === "text" && typeof window !== "undefined" &&
      ref.current && quillRef.current
    ) {
      const toolbarOptions = [
        [{ "size": ["small", false, "large", "huge"] }], // custom dropdown
        [{ "header": [1, 2, 3, 4, 5, 6, false] }],
        [{ "font": [] }],

        ["bold", "italic", "underline", "strike"], // toggled buttons
        ["blockquote", "code-block"],
        ["link", "formula"],

        [{ "header": 1 }, { "header": 2 }], // custom button values
        [{ "list": "ordered" }, { "list": "bullet" }, { "list": "check" }],
        [{ "script": "sub" }, { "script": "super" }], // superscript/subscript
        [{ "indent": "-1" }, { "indent": "+1" }], // outdent/indent

        [{ "align": [] }],

        ["clean"], // remove formatting button
      ];
      quill.value = new Quill(
        quillRef.current,
        {
          modules: {
            toolbar: toolbarOptions,
            table: true,
          },
          placeholder: "type here...", //data[attribute.field] ?? "",
          theme: "snow",
        } satisfies QuillOptions,
      );
      quill.value!.on("text-change", () => {
        ref.current!.value = quill.value!.root!.innerHTML;
      });
      ref.current!.value = data[attribute.field] ?? "";
      setTimeout(() => isReady.value = true, 500);
    }
  }, []);

  const Title = ({ required }: { required?: boolean }) => (
    <div class={"capitalize text-sm font-sans py-1"}>
      {attribute.displayName ?? attribute.field}
      {required && <sup class={"text-red-500 "}>*</sup>}
    </div>
  );
  switch (attribute.type) {
    case "string":
    case "bigint":
    case "int":
    case "date":
    case "email":
    case "boolean":
      return (
        <div>
          <Title />
          <input
            name={attribute.field}
            placeholder={attribute.displayName || attribute.field}
            class={"placeholder:lowercase dark:bg-white rounded-md px-3 py-2 text-sm text-gray-800 border"}
            type={attribute.type === "email"
              ? "email"
              : attribute.type === "bigint" || attribute.type === "int"
              ? "number"
              : attribute.type === "boolean"
              ? "checkbox"
              : "text"}
            value={data[attribute.field] ?? ""}
          />
        </div>
      );
    case "text":
      return (
        <div>
          <Title />
          <div
            ref={quillRef}
            class={"placeholder:lowercase bg-white text-sm text-gray-800 min-h-[10rem]"}
            dangerouslySetInnerHTML={{ __html: data[attribute.field] ?? "" }}
          >
          </div>
          <input
            id={"mce-" + attribute.field}
            name={attribute.field}
            ref={ref}
            hidden
          />
        </div>
      );
    case "enum":
      return (
        <div>
          <Title />
          <div class="select">
            <select name={attribute.field} class={"dark:bg-gray-800"}>
              {Object.entries(attribute.values).map((
                [displayName, value],
                i,
              ) => (
                <option
                  key={i}
                  value={value}
                  selected={data[attribute.field]?.toString() ===
                      value.toString()
                    ? true
                    : false}
                  class={" p-2"}
                >
                  {displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    case "image":
    case "video":
    case "audio":
      return (
        <div>
          <Title />
          <MediaInput
            attribute={attribute}
            value={data[attribute.field] || ""}
          />
        </div>
      );
    case "action":
    default: {
      return <></>;
    }
  }
}
