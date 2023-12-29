import { useSignal, useSignalEffect } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

interface RelationInputProps {
  displayName: string;
  config: RConfigAttribute;
  parent?: RConfigAttribute;
  defaultValue: string;
}

const defaultOption = "---- loading ----";
export default function RelationInput(
  { displayName, config, parent, defaultValue }: RelationInputProps,
) {
  const options = useSignal<DBResult[]>([]);
  const loading = useSignal(true);
  const ref = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const fetchNode = async (cfg: RConfigAttribute, query?: string) => {
      loading.value = true;
      try {
        const res = await fetch(
          "/api/collection/" + cfg.collection + "?" + query || "",
          {
            headers: {
              "content-type": "application/json",
            },
          },
        );
        if (res.status !== 200) throw new Error(res.statusText);
        const { data } = await res.json() as { data: DBResult[] };
        options.value = data;
        if (ref.current) {
          ref.current.dispatchEvent(new Event("options-loaded"));
        }
      } catch (error) {
        console.error(error);
      }
      loading.value = false;
    };
    if (config.node == 0) {
      fetchNode(config);
      return;
    }

    let n: ReturnType<typeof setInterval>;
    const reactToParentNode = () => {
      if (parent) {
        const selectEl = document.getElementById("relation-" + parent.field) as
          | HTMLSelectElement
          | null;
        if (!selectEl) return;

        const key = parent.field;
        const changeFn = (ev: Event) => {
          fetchNode(
            config,
            `${key}=${(ev.target as HTMLSelectElement)?.value}`,
          );
        };
        selectEl.addEventListener("change", changeFn);
        selectEl.addEventListener("options-loaded", changeFn);
        console.log("WATCHING --- ", "relation-" + parent.field);

        n = setInterval(() => {
          if (selectEl.value != "" && selectEl.value != defaultOption) {
            fetchNode(config, `${key}=${selectEl.value}`);
            return clearInterval(n);
          }
        }, 800 * config.node);
      }
    };
    reactToParentNode();
    return () => clearTimeout(n);
  }, []);

  return (
    <div>
      <div>
        {displayName}
      </div>
      <div class="select w-full">
        <select
          id={"relation-" + config.field}
          name={config.field}
          class={"dark:bg-gray-800"}
          ref={ref}
        >
          {loading.value && <option disabled>{defaultOption}</option>}
          {!loading.value && options.value.map((v, i) => (
            <option
              key={i}
              value={v["id"]}
              selected={v["id"] === defaultValue ||
                v[config.column] === defaultValue ||
                v[config.field] === defaultValue ||
                v[displayName] === defaultValue}
              dangerouslySetInnerHTML={{ __html: v[config.column] }}
            >
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
