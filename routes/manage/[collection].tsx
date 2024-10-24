import { Handlers, PageProps } from "$fresh/server.ts";
import BackButton from "../../islands/BackButton.tsx";
import DeleteButton from "../../islands/DeleteButton.tsx";
import Input from "../../islands/Input.tsx";
import RelationInput from "../../islands/RelationInput.tsx";
import Builder from "../../libs/builder.ts";
import { getConfig, getSchema } from "../../libs/helper.ts";
import uploadObject from "../../libs/s3.ts";
import { FreshApp, State } from "../_middleware.ts";
import { cryptoRandomString } from "random";

async function ___res(ctx: FreshApp) {
  const collection = ctx.params.collection;
  const schema = getSchema(ctx, collection);
  const config = getConfig(ctx, collection);
  if (!schema || !config) return false;

  const id = ctx.state.query.get("id");
  const action = ctx.state.query.get("action");
  // deno-lint-ignore no-explicit-any
  const res: Record<string, any> = { schema, action, config };
  if (id) {
    const v = await Builder.instance.get(schema, {
      [`${schema.table}.id`]: id,
    });
    if (v) {
      res["data"] = v;
    }
  }
  return res;
}
// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(_, ctx) {
    const res = await ___res(ctx);
    if (!res) return ctx.renderNotFound();
    res["message"] = ctx.state.chain["message"];
    res["status"] = ctx.state.chain["status"];
    return ctx.render(res);
  },

  async POST(req, ctx) {
    const collection = ctx.params.collection;
    const schema = getSchema(ctx, collection);
    if (!schema) return ctx.renderNotFound();

    const formData = await req.formData();
    console.log("POST -------    X    --------- FormData", formData);

    let id = ctx.state.query.get("id") ||
      formData.get(schema.uniqueId || "id")?.toString();

    const response = new Map<string, string>();

    const queryParam: Record<string, string | number> = {};

    let __formJoinRelations: ({
      attribute: Attributes & (JoinRelationAttribute);
      value: string;
    })[] = [];

    const dir = Deno.env.get("SPACES_DIRECTORY");
    const files: Map<string, File> = new Map();
    try {
      switch (collection) {
        case "question": {
          const qType = parseInt(
            formData.get("question_type_id")?.toString() || "",
          );
          {
            if (!qType || isNaN(qType)) {
              response.set("message", "Question Type is invalid");
              response.set("status", "failed");
              throw new Error();
            }
          }

          {
            const question = formData.get("question")?.toString();
            if (!question) {
              response.set("message", "Question is required");
              throw new Error();
            }
            queryParam["question"] = question;
          }
          switch (qType) {
            case 1: {
              const opt1 = formData.get("option_1")?.toString();
              const opt2 = formData.get("option_2")?.toString();
              const opt3 = formData.get("option_3")?.toString();
              const opt4 = formData.get("option_4")?.toString();
              const optAnswer = formData.get("short_answer")?.toString();
              if (!opt1 || !opt2 || !opt3 || !opt4 || !optAnswer) {
                response.set(
                  "message",
                  "Option A - D and Option-Answer are required for Objective",
                );
                throw new Error();
              }
              queryParam["option_1"] = opt1;
              queryParam["option_2"] = opt2;
              queryParam["option_3"] = opt3;
              queryParam["option_4"] = opt4;
              queryParam["short_answer"] = optAnswer;
              break;
            }
            case 2:
            case 3: {
              const answer = formData.get("full_answer")?.toString();
              if (!answer) {
                response.set(
                  "message",
                  "Answer is required for Theory / Practical",
                );
                throw new Error();
              }
              queryParam["full_answer"] = answer;
            }
          }

          {
            const qImage = formData.get("question_image") as File;
            if (qImage) {
              if (!qImage.type.startsWith("image/")) {
                response.set(
                  "message",
                  "Question Image is not a valid image",
                );
                throw new Error();
              }

              {
                const arr = qImage.name.split(".");
                const key = dir + cryptoRandomString({ length: 32 }) + "." +
                  arr.at(arr.length - 1);
                queryParam["question_image"] = key;
                files.set(key, qImage);
              }
            }
          }

          {
            const aImage = formData.get("answer_image") as File;
            if (aImage) {
              if (!aImage.type.startsWith("image/")) {
                response.set(
                  "message",
                  "Answer Image is not a valid image",
                );
                throw new Error();
              }

              const arr = aImage.name.split(".");
              const key = dir + cryptoRandomString({ length: 32 }) + "." +
                arr.at(arr.length - 1);
              queryParam["answer_image"] = key;
              files.set(key, aImage);
            }
          }
          break;
        }
        case "faq": {
          const title = formData.get("title");
          if (!title) {
            response.set("message", "Title is required");
            throw new Error();
          }

          queryParam["title"] = title.toString();
          queryParam["slug"] = title.toString().toLowerCase().replace(
            /[^\w ]+/g,
            "",
          )
            .replace(/ +/g, "-") + "-" + cryptoRandomString({ length: 12 });
          break;
        }
        case "podcast": {
          {
            const title = formData.get("title");
            if (!title) {
              response.set("message", "Title is required");
              throw new Error();
            }
            queryParam["title"] = title.toString();
          }

          {
            const url = formData.get("url") as File;
            if (url) {
              const arr = url.name.split(".");
              const key = dir + cryptoRandomString({ length: 32 }) + "." +
                arr.at(arr.length - 1);
              queryParam["url"] = key;
              files.set(key, url);
            }
          }
          break;
        }
        case "lesson": {
          {
            const docs = formData.get("docs_url") as File;
            if (docs) {
              const arr = docs.name.split(".");
              const key = dir + cryptoRandomString({ length: 32 }) + "." +
                arr.at(arr.length - 1);
              queryParam["docs_url"] = key;
              files.set(key, docs);
            }
          }
          {
            const slide = formData.get("slide_url") as File;
            if (slide) {
              const arr = slide.name.split(".");
              const key = dir + cryptoRandomString({ length: 32 }) + "." +
                arr.at(arr.length - 1);
              queryParam["slide_url"] = key;
              files.set(key, slide);
            }
          }
          {
            const video = formData.get("video_url") as File;
            if (video) {
              const arr = video.name.split(".");
              const key = dir + cryptoRandomString({ length: 32 }) + "." +
                arr.at(arr.length - 1);
              queryParam["video_url"] = key;
              files.set(key, video);
            }
          }
          break;
        }
        case "newsfeed": {
          const title = formData.get("title");
          const content = formData.get("content");

          if (!title || !content) {
            response.set("message", "Title or Content cannot be empty");
            throw new Error();
          }
          queryParam["user_id"] = ctx.state.user!.id as string;
          queryParam["slug"] = title.toString().toLowerCase().replace(
            /^(\s|\s+)/g,
            "-",
          ).replace(/[^A-Za-z0-9]/g, "");
          const photo = formData.get("photo") as File;
          if (photo) {
            const arr = photo.name.split(".");
            const key = dir + cryptoRandomString({ length: 32 }) + "." +
              arr.at(arr.length - 1);
            queryParam["photo"] = key;
            files.set(key, photo);
          }
        }
      }

      for (const attr of schema.attributes) {
        for (const [fk, fv] of formData.entries()) {
          if (fk === attr.field) {
            if (queryParam[fk] || fk === "id" || fk === schema.uniqueId) {
              continue;
            }

            switch (attr.type) {
              case "boolean": {
                const i = parseInt(fv.toString());
                queryParam[fk] = isNaN(i) ? 0 : 1;
                break;
              }
              case "string":
              case "bigint":
              case "int":
              case "text":
              case "date":
              case "email":
              case "enum":
                if (fv) {
                  queryParam[fk] = fv?.toString();
                }
                break;
              case "relation": {
                if (
                  attr.relation.type === "oneToMany" &&
                  attr.relation.reference === "forward"
                ) {
                  if (!fv) {
                    response.set(
                      "message",
                      `${attr.displayName || attr.field} is invalid`,
                    );
                    throw new Error();
                  }
                  queryParam[fk] = fv.toString();
                }
                break;
              }
              case "join-relation": {
                if (
                  attr.relation === "belongsTo" ||
                  attr.relation === "belongsToMany"
                ) {
                  if (!fv) {
                    response.set(
                      "message",
                      `${attr.displayName || attr.field} is invalid`,
                    );
                    throw new Error();
                  }
                  __formJoinRelations = __formJoinRelations.concat({
                    attribute: attr,
                    value: fv.toString(),
                  });
                }
                break;
              }
              case "image":
              case "video":
              case "action":
            }
          }
        }
      }

      if (!id) {
        if (
          schema.attributes.find((a) =>
            a.field === "id" || a.field === schema.uniqueId
          )?.type === "uuid"
        ) {
          queryParam[schema.uniqueId || "id"] = crypto.randomUUID();
        }
        const result = await Builder.instance.create(schema, queryParam);
        for (const fr of __formJoinRelations) {
          await Builder.instance.createRelation(fr.attribute.joinTableName, {
            [`${fr.attribute.joinReferenceKey}`]: fr.value,
            [`${fr.attribute.joinForeignKey}`]: result != 0
              ? result
              : queryParam[schema.uniqueId || "id"],
          });
        }
        id = result != 0
          ? result.toString()
          : queryParam[schema.uniqueId || "id"] as string;
      } else {
        queryParam[schema.uniqueId || "id"] = id;
        await Builder.instance.update(schema, id, queryParam);
        for (const fr of __formJoinRelations) {
          if (!fr.value) continue;
          const sql = Builder.instance.builder.queryBuilder().table(fr.attribute.joinTableName)
            .update(fr.attribute.joinReferenceKey, fr.value).where(fr.attribute.joinForeignKey, id).toQuery();
          await (await Builder.getConnection()).execute(sql);
        }
        response.set("id", id);
      }
      for (const [name, value] of files) {
        await uploadObject({
          name,
          body: await (value.arrayBuffer()),
        });
      }
    } catch (error) {
      console.error(error);
      const r = await ___res(ctx);
      if (!r) return ctx.renderNotFound();
      // deno-lint-ignore no-explicit-any
      const data: Record<string, any> = {};
      for (const [k, v] of formData.entries()) {
        data[k] = v;
      }
      r["data"] = data;
      r["message"] = (error as Error).message
        ? error.message // "Something went wrong"
        : response.get("message");
      r["status"] = "failed";
      return ctx.render(r);
    }

    return new Response(null, {
      headers: {
        location: encodeURI(`/manage/${collection}${id ? "?id=" + id : ""}`),
        ["X-CHAINED-MESSAGE"]: `${schema?.name} ${!ctx.state.query.get("id") ? "Created" : "Updated"
          } successfully`,
      },
      status: 303,
    });
  },
};

export default function ManagePage({ data, state }: PageProps) {
  const {
    schema,
    data: result,
    action,
    config,
    message,
    status,
  } = data as {
    schema: Schema;
    config: RelationConfig;
    data?: DBResult;
    action?: ActionAttribute["action"];
    message?: string;
    status?: "failed" | "success";
  };

  return (
    <div class={"h-[90vh] overflow-y-scroll scrollbar w-full"}>
      <div class={"py-2 space-x-3 flex justify-between w-full"}>
        <BackButton />
        {result && (
          <DeleteButton
            id={result[schema.uniqueId || "id"]}
            collection={schema.name.toLowerCase()}
            url={`/collections/${schema.name.toLowerCase()}`}
          />
        )}
      </div>
      <div class={"py-2"}>
        {`Create / Update ${schema.name}`}
      </div>
      {message && (
        <div
          class={`${!status || status === "success" ? "text-green-500" : "text-red-500"
            } text-center space-x-2 flex justify-center py-4 text-sm`}
        >
          {(status && status === "failed") && (
            <div>
              Error:
            </div>
          )}

          <div>
            {message}
          </div>
        </div>
      )}
      <form method={"POST"} encType="multipart/form-data">
        <div class={"space-y-3 p-2"}>
          {Object.entries(config).sort(
            (a, b) => a[1].node - b[1].node,
          ).map(([displayName, cfg], index) => (
            <RelationInput
              key={index}
              config={cfg}
              displayName={displayName}
              parent={config[cfg.parent || ""]}
              defaultValue={result
                ? result[cfg.field] ? result[cfg.field] : result[displayName]
                : ""}
            />
          ))}
          {result && (
            <input
              name={schema.uniqueId || "id"}
              value={result[schema.uniqueId || "id"]}
              hidden
            />
          )}
          {schema.attributes.filter((v) =>
            v.type !== "action" && v.type !== "relation" &&
            v.type !== "join-relation" && v.field !== "id" && !v.hidden
          )
            .map((attr, i) => (
              <Input
                key={i}
                data={result || {}}
                attribute={attr}
              />
            ))}
          <div class={"flex justify-center items-center flex-col py-2"}>
            <button
              class={"uppercase text-xs font-sans font-semibold border rounded-md px-5 py-2 dark:border-gray-300 dark:active:bg-gray-500 dark:hover:bg-gray-400 active:bg-neutral-200 hover:bg-neutral-100"}
            >
              {action === "edit" ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

