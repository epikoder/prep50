import * as ammonia from "https://deno.land/x/ammonia@0.3.1/mod.ts";
import DeleteButton from "./DeleteButton.tsx";
import { Component } from "preact";
await ammonia.init();

// deno-lint-ignore no-explicit-any
interface TableProps<T extends Record<string, any> = Record<string, any>> {
  attributes: SchemaAttribute[];
  data: T[];
  collection: string;
  perPage?: number;
  currentPage?: number;
}
interface TableState {
  page: number;
}

export default class Table extends Component<TableProps, TableState> {
  render() {
    const { attributes, collection, data } = this.props;
    const _attrs = Object.values(attributes).filter((v) => !v.hidden);
    return (
      <div class={"h-full max-h-fit"}>
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg table-container h-[80%]">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                {_attrs.map((
                  v,
                  i,
                ) => (
                  <th key={i} scope="col" class="px-6 py-3 whitespace-nowrap">
                    {v.displayName ?? v.field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((value, key) => (
                <TR
                  key={key}
                  row={value}
                  index={key}
                  attributes={_attrs}
                  collection={collection}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

interface TRProps {
  // deno-lint-ignore no-explicit-any
  row: Record<string, any>;
  attributes: SchemaAttribute[];
  collection: string;
  index: number;
}

function TR(
  { row, attributes, collection, index }: TRProps,
) {
  let columns: {
    attribute: SchemaAttribute;
    value: string;
    collection: string;
  }[] = [];
  for (const attr of attributes) {
    for (const [field, value] of Object.entries(row)) {
      if (attr.field === field || attr.displayName === field) {
        let value = row[field] as string || "";
        if (field === "id") {
          value = (index + 1).toString();
        }
        if (
          attr.type !== "relation" && attr.type !== "join-relation" &&
          attr.type !== "action" && value.length > 50
        ) {
          value = value?.replaceAll(/^s+/g, " ")?.slice(
            0,
            50,
          ).concat("...");
        }
        columns = columns.concat({
          attribute: attr,
          value,
          collection,
        });
      }
    }
  }

  return (
    <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
      {Object.values(columns).map((v, i) => <TD key={i} {...v} />)}
    </tr>
  );
}

interface TDProps {
  attribute: SchemaAttribute;
  value: string;
  collection: string;
}

function TD({ attribute, value, collection }: TDProps) {
  const _Render = () => {
    switch (attribute.type) {
      case "enum":
        return (
          <div class={"whitespace-nowrap"}>
            {Object.keys(attribute.values).find((v) =>
              attribute.values[v] ===
                value
            )}
          </div>
        );
      case "relation":
      case "join-relation":
        if (
          (attribute.type === "relation" &&
            attribute.relation.type === "oneToMany" &&
            attribute.relation.reference === "backward") ||
          (attribute.type === "join-relation" &&
            (attribute.relation === "hasMany" ||
              attribute.relation === "hasOne"))
        ) {
          return (
            <a
              class={"hover:text-gray-700 dark:hover:text-gray-300 text-green-600 transition-all"}
              href={(`/collections/${attribute.collection}?`) +
                (attribute.type === "relation"
                  ? attribute.target.replace(":", ".")
                  : `${attribute.joinTableName}.${attribute.joinForeignKey}`) +
                "=" + value}
            >
              {attribute.displayName ?? attribute.field}
            </a>
          );
        }
        return (
          <div class={"whitespace-nowrap"}>
            {value}
          </div>
        );
      case "action":
        return (
          <Action
            url={`/manage/${collection}?action=${attribute.action}&id=${
              value || ""
            }`}
            attribute={attribute}
            collection={collection}
            id={value}
          />
        );
      case "image":
      case "video":
      case "audio":
      case "file":
        return (
          <div>
            {value}
          </div>
        );
    }
    return (
      <div
        class={"whitespace-nowrap"}
        dangerouslySetInnerHTML={{ __html: ammonia.clean(value) }}
      >
      </div>
    );
  };
  return (
    <td
      class={`px-6 py-4 max-w-md min-w-fit`}
    >
      <_Render />
    </td>
  );
}

interface ActionProps {
  attribute: Attributes & ActionAttribute;
  url: string;
  id: string;
  collection: string;
}
function Action(
  { attribute, url, collection, id }: ActionProps,
) {
  switch (attribute.action) {
    case "edit":
      return (
        <a
          href={url}
          class={"capitalize flex space-x-1 hover:text-gray-400 dark:hover:text-gray-100 transition-all"}
        >
          <span>
            {attribute.displayName || attribute.field}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
          </svg>
        </a>
      );
    case "delete":
      return (
        <>
          <DeleteButton collection={collection} id={id} />
        </>
      );
    case "view":
      return (
        <>
          {attribute.displayName || attribute.field}
        </>
      );
  }
}
