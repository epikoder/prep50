import hbs from "hbs";

function schemaField(
  context: Schema["attributes"][number],
  options: { fn: (arg0: any) => string }
) {
  if (context.type === "action") return context.displayName || context.field;
  if (context.hidden) return;
  if (
    context.type === "relation" ||
    context.type === "enum" ||
    context.type === "join-relation"
  ) {
    return context.displayName || context.field;
  }
  return options.fn({ field: context.field });
}

function schemaValue(
  context: Record<string, any>,
  options: { fn: (arg0: any) => string; [k: string]: any }
) {
  var ret = "";
  const schema: Schema = options.hash.schema;

  for (const attr of schema.attributes) {
    for (const key of Object.keys(context)) {
      if (
        attr.field === key ||
        (attr.type === "relation" &&
          (attr.displayName == key ||
            (attr.relation.column == key &&
              attr.relation.type === "oneToOne"))) ||
        (attr.type === "join-relation" && attr.displayName == key) ||
        attr.field == key
      ) {
        let f = {
          key: `${schema.name.toLowerCase()}-${attr.field.toLowerCase()}`,
          value:
            (key == schema.uniqueId || key === "id") &&
            options.hash.index != undefined
              ? ((options.hash.index as number) || 0) + 1
              : context[key],
          field: (attr.type === "relation" && attr.displayName) || attr.field,
          relation: attr.type === "relation",
          hidden: attr.hidden,
          classes: `${
            attr.type === "relation" ||
            attr.type === "join-relation" ||
            attr.type === "enum" ||
            attr.field === "name"
              ? "whitespace-nowrap"
              : ""
          }`,
        };
        if (
          (attr.type === "relation" &&
            attr.relation.type === "oneToMany" &&
            attr.relation.reference === "backward") ||
          (attr.type === "join-relation" && attr.relation === "hasMany")
        ) {
          let uri = "";
          const root = options.data.root;

          if (root.parent_schema && root.child_schema) {
            if (schema.node! > 2) continue; /** Max at 3 nodes */
            // Has a parent node
            uri = `/collections/${root.parent_schema.name.toLowerCase()}/${
              schema.node === 0
                ? context[schema.uniqueId || "id"]
                : root.parent.id
            }/${(schema.node! === 0
              ? attr.collection
              : root.child_schema.name
            ).toLowerCase()}/`;
            switch (schema.node!) {
              case 0:
                break;
              case 1: {
                uri += `${
                  context[schema.uniqueId || "id"]
                }/${attr.collection.toLowerCase()}`;
                break;
              }
              default: {
                uri = `#`;
              }
            }
          } else {
            uri = `/collections/${schema.name.toLowerCase()}/${context["id"]}/${
              attr.collection
            }`;
          }

          let templ = `<div> <a class="capitalize" href="${encodeURI(
            uri.replace(/^\/+/g, "/").replace(/^\?+/g, "?")
          )}"> ${attr.displayName || attr.field} </a></div>`;
          f.value = templ;
        } else if (attr.type === "action") {
          let templ = "";
          switch (attr.action) {
            case "edit": {
              templ = `<div> <a class="capitalize" href="/update/${schema.name.toLowerCase()}/${
                context[key]
              }"> ${attr.displayName || attr.field} </a></div>`;
              break;
            }
            case "delete": {
            }
          }
          f.value = templ;
        } else if (attr.type === "enum") {
          f.value = `<div style="text-align:center;" > ${Object.keys(
            attr.values
          ).find((k) => context[attr.field] == attr.values[k])} </div>`;
        } else if (attr.type === "text") {
          let v = context[attr.field] as string | undefined;
          f.value = (v?.length || 0) > 200 ? "[[!!TRUNCATED!!]]" : v;
        }
        ret += options.fn(f);
      }
    }
  }

  return ret;
}

export function schemaFormInput(
  context: Schema["attributes"][number],
  options: { fn: (arg0: any) => string; [k: string]: any }
) {
  const schema: Schema = options.hash.schema;
  const data: Record<string, any> = options.hash.data;
  const ret: { field: string; title: string; hidden: boolean } = {
    field: "",
    title: context.field,
    hidden: !!context.hidden,
  };

  switch (context.type) {
    case "bigint":
    case "string":
    case "boolean":
    case "int":
    case "date": {
      if (context.field === "id" || context.field == schema.uniqueId) {
        ret.field += `<input placeholder="${
          context.field
        }" class="_text-field" name="${context.field}" type="${
          context.type === "date" ? "date" : "text"
        }" value="${data[context.field]}" hidden/>`;
        ret.title = "";
      } else {
        ret.field += `<input placeholder="${
          context.field
        }" class="_text-field" name="${context.field}" type="${
          context.type === "date" ? "date" : "text"
        }" value="${data[context.field] ?? ""}"/>`;
      }
      break;
    }
    case "text": {
      if (context.field === "id" || context.field == schema.uniqueId) {
        ret.field += `<textarea placeholder="${
          context.field
        }" class="_text-field" name="${context.field}" value="${
          data[context.field]
        }" hidden></textarea>`;
        ret.title = "";
      } else {
        ret.field += `<textarea placeholder="${
          context.field
        }" class="_text-field" style="min-height: 150px" name="${
          context.field
        }">${data[context.field] ?? ""}</textarea>`.replace(/^\s+/g, " ");
      }
      break;
    }
    // case "image":
    case "enum":
      ret.field += `<select class="_text-field" name="${context.field}">`;
      ret.field += Object.entries(context.values || {})
        .map(
          ([k, v]) =>
            `<option value="${v}" ${
              v === data[context.field] ? "selected" : ""
            } > ${k} </option>`
        )
        .join(" ");
      ret.field += `</select>`;
      ret.title = context.displayName ?? context.field;
      break;
    case "action":
      ret.hidden = true;
  }
  ret.title = ret.field.length === 0 ? "" : ret.title;
  return options.fn(ret);
}

export default () => {
  hbs.registerHelper("schemaField", schemaField);
  hbs.registerHelper("schemaValue", schemaValue);
  hbs.registerHelper("log", function (context, _) {
    console.log("HBS:LOG", context);
  });
  hbs.registerHelper(
    "inject",
    function (this: Record<string, any>, context, options) {
      let v: Record<string, any> = {};
      const _options = options || context;
      for (let k of Object.keys(_options.hash)) {
        if (k.startsWith("_")) {
          v[k.replace("_", "")] = _options.hash[k];
          continue;
        }
        if (options) {
          v[k] = context[_options.hash[k]];
        }
      }
      if (!options) {
        v = { ...v, ...this };
      }
      return _options.fn(v);
    }
  );

  hbs.registerHelper("formInput", schemaFormInput);
  hbs.registerHelper("relationFormInput", schemaRelationFormInput);
  hbs.registerPartials("templates/views/_partials");
};

const watchFn = ({
  column,
  field,
  collection,
  injectField,
  value,
}: {
  column: string;
  field: string;
  injectField: string;
  collection: string;
  value?: string;
}): string => {
  return `$watch('${field}', async (oldValue, newValue) => {
    this.loading = true;
    try {
      const res = await fetch('/api/${collection}?${field}='+this.${field});
      if (res.status !== 200) {
        throw new Error('Failed fetching resource');
      }
      ${injectToHtmL({ column, field: injectField, value })}

      let pValue = '${value ? value : ""}';
      pValue = pValue ? pValue : oldValue;
      let value = data.find(v => v.id.toString() == pValue);

      setTimeout(() => {
        this.${injectField} = value ? value.id.toString() : '';
        console.log('setting... ${injectField}');
      }, 500);
    } catch (err) {
      console.log('WATCH ${field}:', err);
    }
    this.loading = false;
  });`;
};

const injectToHtmL = ({
  column,
  field,
  value,
}: {
  column: string;
  field: string;
  value?: string;
}): string => `
  let selectEl = document.getElementById('alpine_${field}');
  let def = document.createElement('option');
  def.value = '-1';
  def.innerHTML = '-- select --';
  def.selected = ${!value};
  selectEl.innerHTML = '';
  selectEl.append(def);
  let data = (await res.json()).data;
  for (const v of data) {
    let opt = document.createElement('option');
    opt.id = v.id;
    opt.value = v.id;
    if (v.id == '${value ?? ""}') {
      opt.selected = true;
    }
    opt.innerHTML = v.${column};
    selectEl.appendChild(opt);
  }
`;

const loader = `<div
x-cloak
x-show="loading"
class="absolute top-0 left-0 right-0 bottom-0 z-1 m-0 overlay">
    <div class="loader">
        <svg class="circular">
            <circle
              cx="50"
              cy="50"
              r="20"
              fill="none"
              stroke-width="5"
              stroke-miterlimit="10"
              class="path">
            </circle>
          </svg>
      </div>
  </div>`;

function schemaRelationFormInput(
  config: RelationConfig | undefined,
  options: { fn: (arg0: any) => string; [k: string]: any }
) {
  if (!config) return "";
  const data = <Record<string, any>>options.hash.data;
  let raw = `<div 
    class="space-y-2 p-2"
    x-data="{
    loading: false,
    `;
  raw += Object.values(config)
    .map((f) => `${f.field}: ''`)
    .join(",")
    .concat(",");
  raw += `init() {`;
  for (const en of Object.entries(config)) {
    if (en[1].parent) {
      raw += watchFn({
        field: config[en[1].parent].field,
        collection: en[1].collection,
        column: en[1].column,
        injectField: en[1].field,
        value: data[en[1].field],
      });
    } else {
      // console.log(data, en[1].field);
      raw += `
      (async () => {
        this.loading = true;
        try {
          const res = await fetch('/api/${en[0].toLowerCase()}');
          if (res.status !== 200) {
            throw new Error('Failed fetching resource');
          }
          ${injectToHtmL({ ...en[1], value: data[en[1].field] })}
          let value = '${data[en[1].field].toString()}';
          setTimeout(() => {
            this.${en[1].field} = value ? value : '';
            console.log('setting... ROOT:: ${en[1].field}');
          }, 500);
        } catch (err) {
          console.log(err);
        }
        this.loading = false;
      })();
      `;
    }
  }
  raw += `}}">`;

  for (const en of Object.entries(config).sort(
    (a, b) => a[1].node - b[1].node
  )) {
    let v: Record<string, string> = { title: en[0] };
    v.raw = `<select
    id="alpine_${en[1].field}"
    name="${en[1].field}"
    class="_select-field"
    x-model="${en[1].field}">
    </select>`;
    raw += options.fn(v);
  }

  raw += loader;
  raw += `</div>`;
  return raw;
}
