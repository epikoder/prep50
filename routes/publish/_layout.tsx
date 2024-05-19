import { Handler, LayoutConfig, PageProps } from "$fresh/server.ts";
import { Fragment } from "preact/jsx-runtime";
import BackButtonPublish from "../../islands/publish/BackButtonPublish.tsx";
export const config: LayoutConfig = {
  skipInheritedLayouts: true,
};

export default function _({ Component, url }: PageProps) {
  return (
    <Fragment>
      <div class={"font-serif text-sm"}>
        <div
          class={"fixed z-50 left-0 right-0 top-0 h-20 bg-opacity-40 backdrop-blur-sm bg-white"}
        >
          <div
            class={"flex justify-between max-w-screen-xl items-center mx-auto h-full px-2"}
          >
            <div class={"flex space-x-2"}>
              <BackButtonPublish />
              <a href={"/publish"}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 hover:bg-[#46b5ff] hover:text-white p-1 rounded"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </a>
            </div>
            <div class={"text-sm uppercase pl-8"}>
              {"Prep50"}{" "}
              {url.pathname.includes("/walkthrough/") && (
                <span>{" Walkthrough"}</span>
              )}
            </div>
            <a href="/publish/create" class={"flex space-x-2 items-center"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 hover:bg-[#46b5ff] hover:text-white p-1 rounded"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>{" "}
              <div class={"hidden lg:block text-xs uppercase"}>Add New</div>
            </a>
          </div>
        </div>
        <div class={"pt-20 w-full"}>
          <Component />
        </div>
      </div>
    </Fragment>
  );
}
