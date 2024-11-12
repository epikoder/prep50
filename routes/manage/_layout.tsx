import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function ManageLayout({ Component, state }: PageProps) {
  return (
    <>
      <Head>
        <script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js">
        </script>
        <link
          href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css"
          rel="stylesheet"
        />
      </Head>
      <div class={"px-4 w-full"}>
        <Component />
      </div>
    </>
  );
}
