import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function ManageLayout({ Component, state }: PageProps) {
  return (
    <>
      <Head>
        <link
          href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/css/suneditor.min.css"
          rel="stylesheet"
        />
        <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js">
        </script>
        <script src="https://cdn.jsdelivr.net/npm/suneditor@latest/src/plugin/index.js">
        </script>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css"
        />
        <script src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js">
        </script>
      </Head>
      <div class={"px-4 w-full"}>
        <Component />
      </div>
    </>
  );
}
