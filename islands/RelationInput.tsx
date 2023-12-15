import { useSignal, useSignalEffect } from "@preact/signals";
import { useEffect } from "preact/hooks";

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
        selectEl.addEventListener("change", (ev) => {
          fetchNode(
            config,
            `${key}=${(ev.target as HTMLSelectElement)?.value}`,
          );
        });
        const observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            console.log("Do your thing", mutation);
          });
        });
        observer.observe(
          selectEl,
          {
            attributes: true,
            attributeFilter: ["lang"],
            subtree: true,
          },
        );
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

    // var observerConfig = {
    //     attributes: true,
    //     attributeFilter: ['lang'],
    //     subtree: true
    // };

    // var target = document.querySelector('.languages');

    // observer.observe(target, observerConfig);
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
            >
              {v[config.column]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
