import { useEffect } from "preact/hooks";
import MediaInput from "./MediaInput.tsx";
import { Selector } from "./Select.tsx";

interface InputProps {
  attribute: SchemaAttribute;
  // deno-lint-ignore no-explicit-any
  data: Record<string, any>;
}
export default function Input({ attribute, data }: InputProps) {
  useEffect(() => {
    if (attribute.type === "text" && typeof window !== "undefined") {
      const sc = document.createElement("script");
      sc.innerHTML = `
      (function () {
        const txtarea = document.getElementById('mce-${attribute.field}')
        const options = {
          selector: 'textarea#mce-${attribute.field}',
          height: 300,
          resize: true,
          menubar: false,
          statusbar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
            "autoresize",
          ],
          toolbar: 'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat',
          content_style:
            'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; -webkit-font-smoothing: antialiased; }',
          setup: (editor) => {
            editor.on('change', (ev) => {
                txtarea.innerHTML = editor.getContent();
            })
          },
          // external_plugins: {
          //   tiny_mce_wiris: 'https://www.npmjs.com/package/@wiris/mathtype-tinymce4/plugin.min.js',
          // }
        };
        if (localStorage.getItem('tablerTheme') === 'dark') {
          options.skin = 'oxide-dark';
          options.content_css = 'dark';
        }
        tinyMCE.init(options);
      })();
      `;
      document.head.appendChild(sc);
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
          <textarea
            id={"mce-" + attribute.field}
            name={attribute.field}
            placeholder={(attribute.displayName || attribute.field)
              .toLowerCase()}
            class={"placeholder:lowercase dark:bg-white rounded-md px-3 py-2 text-sm text-gray-800"}
            onChange={(e) => {
              console.log(e);
            }}
          >
            {data[attribute.field] ?? ""}
          </textarea>
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
