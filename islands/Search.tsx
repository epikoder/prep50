import * as ammonia from "https://deno.land/x/ammonia@0.3.1/mod.ts";
import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
await ammonia.init();

interface SearchProps {
  collection: string;
  attributes: (Attributes & CommonAttributes)[];
}

export default function Search({ attributes, collection }: SearchProps) {
  const searching = useSignal(false);
  const loading = useSignal(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const result = useSignal<DBResult[]>([]);
  const schema = useSignal<Schema | undefined>(undefined);

  let abortController: AbortController;
  const fetchData = async (text: string) => {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    loading.value = true;
    try {
      const res = await fetch(
        encodeURI(
          "/api/collection/" + collection + "?search=" + text + "&fields=" +
            attributes.map(
              (a) => a.field,
            ),
        ),
        {
          credentials: "include",
          signal: abortController.signal,
        },
      );
      if (res.status != 200) throw new Error(res.statusText);
      const data = await res.json();
      result.value = data.data;
      schema.value = data.schema;
    } catch (error) {
      console.log(error);
    }
    loading.value = false;
  };

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searching.value]);

  return (
    <div class={"flex my-auto"}>
      <input
        type={"text"}
        class={"rounded px-2 py-1 text-black text-xs"}
        placeholder={"Search...."}
        onFocus={(ev) => {
          searching.value = true;
          (ev.target as HTMLInputElement).blur();
        }}
      />
      {searching.value && (
        <div
          class={"absolute z-10 w-[100vw] h-[100vh] left-0 right-0 top-0 bottom-0 bg-gray-400 bg-opacity-40 flex flex-col items-center py-8"}
          onMouseDown={(ev) => {
            if (
              ref.current && !ref.current.contains(ev.target as HTMLDivElement)
            ) {
              searchInputRef?.current?.blur();
              searching.value = false;
            }
          }}
          onClick={(ev) => {
            if (
              ref.current && !ref.current.contains(ev.target as HTMLDivElement)
            ) {
              searchInputRef?.current?.blur();
              searching.value = false;
            }
          }}
        >
          <div
            class={"w-[70%] min-h-[20%] max-h-[85%] shadow-lg bg-white rounded-md"}
            ref={ref}
          >
            <div class="flex border-b-2 rounded-t-md px-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6 text-black m-auto"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>

              <input
                type={"text"}
                class={"p-3 border-none active:outline-none outline-none focus:outline-none rounded-t-md text-black sticky top-0"}
                placeholder={"Search...."}
                ref={searchInputRef}
                onKeyUp={(ev) => {
                  debounce(() => {
                    const el = ev.target as HTMLInputElement;
                    fetchData(el.value);
                  }, 1200);
                }}
              />
            </div>
            <div
              class={"rounded-b-md p-4 text-black max-h-[90%] space-y-2 overflow-y-scroll scrollbar"}
              ref={resultRef}
            >
              {(!loading.value && schema.value && result.value.length > 0) &&
                result.value.map((v, k) => (
                  <Render
                    attributes={attributes}
                    schema={schema.value!}
                    data={v}
                    key={k}
                    cb={() => searching.value = false}
                  />
                ))}
              {(!loading.value && result.value.length == 0) && (
                <div class={"flex flex-col justify-center items-center"}>
                  {"Nothing to show... Try keywords"}
                </div>
              )}
              {loading.value &&
                (
                  <div class={"flex flex-col justify-center items-center"}>
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span class="sr-only">Loading...</span>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Render(
  { attributes, data, schema, cb }: {
    attributes: (Attributes & CommonAttributes)[];
    data: DBResult;
    schema: Schema;
    cb?: VoidFunction;
  },
) {
  const relAttr = schema.attributes.filter((a) =>
    (a.type == "relation" && a.relation.type == "oneToMany" &&
      a.relation.reference == "forward") ||
    (a.type == "join-relation" &&
      (a.relation == "belongsTo" || a.relation == "belongsToMany"))
  ) as (Attributes & (RelationAttribute | JoinRelationAttribute))[];

  return (
    <a
      href={`/manage/${schema.name.toLowerCase()}?action=${"edit"}&id=${
        data[schema.uniqueId] || data["id"]
      }`}
    >
      <div
        class={"p-1 rounded-md border space-y-1 text-xs cursor-pointer hover:bg-gray-100 hover:shadow-md my-1"}
        onClick={() => {
          if (cb) cb();
        }}
      >
        {relAttr.map((a, k) => (
          <div class={"flex space-x-2"}>
            <div
              class={"bg-gray-200 rounded px-2 py-[0.1rem] text-[0.6rem] uppercase shadow"}
              dangerouslySetInnerHTML={{
                __html: ammonia.clean(a.displayName ? a.displayName : a.field),
              }}
            >
            </div>
            <div
              key={k}
              class={"text-gray-800"}
              dangerouslySetInnerHTML={{
                __html: ammonia.clean(
                  a.displayName ? data[a.displayName] : data[a.field],
                ),
              }}
            >
            </div>
          </div>
        ))}
        {attributes.map((a, k) => (
          <div
            key={k}
            class={"text-gray-800"}
            dangerouslySetInnerHTML={{
              __html: ammonia.clean(
                (data[a.field] as string).slice(0, 300).concat(
                  (data[a.field] as string).length > 300 ? "..." : "",
                ),
              ),
            }}
          >
          </div>
        ))}
      </div>
    </a>
  );
}

let timeout: number;
function debounce(fn: VoidFunction, delay: number) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    clearTimeout(timeout);
    fn();
  }, delay);
}
