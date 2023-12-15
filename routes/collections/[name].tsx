import { PageProps } from "$fresh/server.ts";
import BackButton from "../../islands/BackButton.tsx";
import JumpPage from "../../islands/JumpPage.tsx";
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
    const page = parseInt(ctx.state.jsonQuery["currentPage"]);
    delete ctx.state.jsonQuery["currentPage"];
    const builder = Builder.instance();
    const [{ data, pagination }, count] = await Promise.all([
      builder.getAll(schema, ctx.state.jsonQuery, true, isNaN(page) ? 1 : page),
      builder.count(schema),
    ]);
    return ctx.render({
      schema,
      data,
      count,
      collection,
      pagination,
    });
  } catch (error) {
    throw new Error(error);
  }
}

export default function Model(props: PageProps) {
  const { schema, data, collection, pagination } = props.data as {
    schema: Schema;
    data: DBResult[];
    collection: string;
    pagination: Pagination;
  };

  return (
    <div class={"w-[90%]"}>
      <div class={"flex justify-between p-2"}>
        <div class={"flex space-x-2"}>
          <BackButton />
          <div class={"capitalize space-x-6"}>
            <span>{collection}</span>
            <span class={"font-sans text-xs"}>Total: {pagination.total}</span>
          </div>
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
      <RenderPagination {...pagination} collection={collection} />
      <JumpPage lastPage={pagination.lastPage} collection={collection} />
    </div>
  );
}

function RenderPagination(
  { currentPage, lastPage, prevPage, nextPage, collection }: Pagination & {
    collection: string;
  },
) {
  return (
    <div class="flex justify-center space-x-2">
      {currentPage !== 1 && (
        <Page currentPage={currentPage} page={1} collection={collection} />
      )}
      <RenderClosePage
        currentPage={currentPage}
        collection={collection}
      />
      <Page
        currentPage={currentPage}
        collection={collection}
        page={currentPage}
      />
      <RenderClosePage
        currentPage={currentPage}
        collection={collection}
        endOrStart={lastPage}
      />
      {currentPage !== lastPage && (
        <Page
          currentPage={currentPage}
          page={lastPage}
          collection={collection}
        />
      )}
    </div>
  );
}

const Page = (
  { page, collection, currentPage }: {
    page: number;
    collection: string;
    currentPage: number;
  },
) => (
  <a
    href={`/collections/${collection}?currentPage=${page}`}
    class={`px-2 py-1 rounded-md dark:hover:bg-gray-500 hover:bg-gray-300 text-xs ${
      page == currentPage ? "dark:bg-gray-600 bg-gray-400 text-white" : ""
    }`}
  >
    {page}
  </a>
);

const MAX_PREVIEW = 5;
const RenderClosePage = (
  { currentPage, endOrStart = 1, collection }: {
    currentPage: number;
    endOrStart?: number;
    collection: string;
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
          ? pageNumbers.length - 2
          : undefined,
      ).map((v, k) => (
        <Page
          key={k}
          page={v}
          currentPage={currentPage}
          collection={collection}
        />
      ))}
      {numberOfLinks !== 0 && pageNumbers.at(pageNumbers.length - 1) &&
        pageNumbers.at(pageNumbers.length - 1)! < endOrStart && <Dot />}
    </>
  );
};

const Dot = () => <div class="whitespace-nowrap">...</div>;
