import { PageProps } from "$fresh/server.ts";
import BackButton from "../../islands/BackButton.tsx";
import Input from "../../islands/Input.tsx";
import JumpPage from "../../islands/JumpPage.tsx";
import Search from "../../islands/Search.tsx";
import Table from "../../islands/Table.tsx";
import Builder from "../../libs/builder.ts";
import { FreshApp } from "../_middleware.ts";

export async function handler(req: Request, ctx: FreshApp) {
  const collection = ctx.params.name as string;
  const schema = ctx.state.context.schema().get(collection);
  if (!schema) {
    return ctx.renderNotFound();
  }

  try {
    const page = parseInt(ctx.state.jsonQuery["current_page"]);
    delete ctx.state.jsonQuery["current_page"];
    const builder = Builder.instance();
    const [{ data, pagination }, count] = await Promise.all([
      builder.getAll(schema, ctx.state.jsonQuery, true, isNaN(page) ? 1 : page),
      builder.count(schema),
    ]);

    let uri: string[] = []
    for (const key of (Object.keys(ctx.state.jsonQuery))) {
      uri = uri.concat(key + '=' + ctx.state.jsonQuery[key])
    }
    return ctx.render({
      schema,
      data,
      count,
      collection,
      pagination,
      query: uri.join('&')
    });
  } catch (error) {
    throw new Error(error);
  }
}

export default function Model(props: PageProps) {
  const { schema, data, collection, pagination, query } = props.data as {
    schema: Schema;
    data: DBResult[];
    collection: string;
    pagination: Pagination;
    query: string;
  };

  const searchable = schema.attributes
    .filter((
      a,
    ) => {
      switch (a.type) {
        case "string":
        case "text":
          return a.searchable;
        default:
          return false;
      }
    }) as (Attributes & CommonAttributes)[];

  return (
    <div class={"w-[90%]"}>
      <div class={"flex justify-between p-2"}>
        <div class={"flex space-x-2"}>
          <BackButton />
          <div class={"capitalize space-x-6"}>
            <span>{collection}</span>
            <span class={"font-sans text-xs"}>Total: {pagination.total}</span>
          </div>
          {searchable.length > 0 && (
            <Search attributes={searchable} collection={collection} />
          )}
        </div>
        <div class={"space-x-2"}>
          <a
            class={"font-sans text-sm dark:text-gray-200 text-gray-800 border rounded-md px-2 py-1"}
            href={"/manage/" + collection}
          >
            {"Add New"}
          </a>
        </div>
      </div>
      <div class="h-[80vh] overflow-y-scroll scrollbar py-4">
        <Table
          attributes={schema.attributes}
          data={data || []}
          collection={collection}
        />
      </div>
      <RenderPagination {...pagination} collection={collection} query={query} />
      <JumpPage lastPage={pagination.lastPage} collection={collection} query={query} />
    </div>
  );
}

function RenderPagination(
  { currentPage, lastPage, prevPage, nextPage, collection, query }: Pagination & {
    collection: string;
    query: string;
  },
) {
  console.log("CURRENT PAGE", currentPage)
  return (
    <div class="flex justify-center space-x-2">
      {currentPage !== 1 && (
        <Page currentPage={currentPage} page={1} collection={collection} query={query} />
      )}
      <RenderSiblingPage
        currentPage={currentPage}
        collection={collection}
        query={query}
      />
      <Page
        currentPage={currentPage}
        collection={collection}
        page={currentPage}
        query={query}
      />
      <RenderSiblingPage
        currentPage={currentPage}
        collection={collection}
        endOrStart={lastPage}
        query={query}
      />
      {currentPage !== lastPage && (
        <Page
          currentPage={currentPage}
          page={lastPage}
          collection={collection}
          query={query}
        />
      )}
    </div>
  );
}

const Page = (
  { page, collection, currentPage, query }: {
    page: number;
    collection: string;
    currentPage: number;
    query: string
  },
) => (
  <a
    href={`/collections/${collection}?${query}&current_page=${page}`}
    class={`px-2 py-1 rounded-md dark:hover:bg-gray-500 hover:bg-gray-300 text-xs ${page == currentPage ? "dark:bg-gray-600 bg-gray-400 text-white" : ""}`}
  >
    {page}
  </a>
);

const MAX_PREVIEW = 5;
const RenderSiblingPage = (
  { currentPage, endOrStart = 1, collection, query }: {
    currentPage: number;
    endOrStart?: number;
    collection: string;
    query: string;
  },
) => {
  const isStart = currentPage >= endOrStart;
  const numberOfLinks = isStart
    ? Math.abs(endOrStart - currentPage) > MAX_PREVIEW
      ? MAX_PREVIEW
      : Math.abs(endOrStart - currentPage)
    : endOrStart - currentPage > MAX_PREVIEW
      ? MAX_PREVIEW
      : endOrStart - currentPage;

  const pageNumbers = Array.from(
    Array(isStart && numberOfLinks ? numberOfLinks - 1 : numberOfLinks).keys(),
  ).map((
    v,
  ) => (isStart ? currentPage - numberOfLinks + v + 1 : v + 1 + currentPage));

  return (
    <>
      {isStart && numberOfLinks !== 0 && currentPage > MAX_PREVIEW && <Dot />}
      {pageNumbers.slice(
        0,
        !isStart && endOrStart - currentPage <= MAX_PREVIEW
          ? pageNumbers.length - 1
          : undefined,
      ).map((v, k) => (
        <Page
          key={k}
          page={v}
          currentPage={currentPage}
          collection={collection}
          query={query}
        />
      ))}
      {numberOfLinks !== 0 && pageNumbers.at(pageNumbers.length - 1) &&
        pageNumbers.at(pageNumbers.length - 1)! < endOrStart && <Dot />}
    </>
  );
};

const Dot = () => <div class="whitespace-nowrap">...</div>;
