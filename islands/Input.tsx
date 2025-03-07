import { useEffect, useRef } from "preact/hooks";
import MediaInput from "./MediaInput.tsx";
import { useSignal } from "@preact/signals";

interface InputProps {
  attribute: SchemaAttribute;
  // deno-lint-ignore no-explicit-any
  data: Record<string, any>;
}
export default function Input({ attribute, data }: InputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isReady = useSignal(false);

  useEffect(() => {
    if (
      attribute.type === "text" && typeof window !== "undefined" &&
      ref.current && editorRef.current
    ) {
      const defaultValue = data[attribute.field] ?? "";
      ref.current!.value = defaultValue;
      const sunEditor = SUNEDITOR.create(editorRef.current, {
        katex: globalThis.katex,
        buttonList: [
          ["undo", "redo"],
          ["bold", "underline", "italic", "strike", "subscript", "superscript"],
          ["font", "formatBlock", "fontSize"],
          ["paragraphStyle", "blockquote"],
          ["outdent", "indent"],
          ["align", "horizontalRule", "list", "lineHeight"],
          ["image", "video", "table", "math"],
          ["removeFormat", "fullScreen", "codeView", "preview"],
        ],
        tagWhitelist: "table,tr,td,th,thead,tbody,strong,em,span,img,a",
        pasteTagsWhitelist: "table,tr,td,th,thead,tbody,strong,em,span,img,a",
        attributesWhitelist: {
          "all": "*",
        },
        iframe: false,
        height: 300,
        value: defaultValue,
      });
      containerRef.current!.onmouseleave = () =>
        ref.current!.value = sunEditor.getContents();
      containerRef.current!.onsubmit = () =>
        ref.current!.value = sunEditor.getContents();

      setTimeout(() => {
        isReady.value = true, 500;
      });
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
          <div ref={containerRef}>
            <textarea
              ref={editorRef}
              class={"placeholder:lowercase bg-white text-sm text-gray-800 min-h-[10rem]"}
              value={data[attribute.field]}
            >
            </textarea>
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
