import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function ManageLayout({ Component, state }: PageProps) {
  return (
    <>
      <Head>
        <script
          src="https://cdn.tiny.cloud/1/w0g0gbf73ue47o95f8abe8ily6c63tthti23raokvsxjqqjd/tinymce/7/tinymce.min.js"
          referrerpolicy="origin"
        />
        <link
          href="/tiny_mce.css"
          rel="stylesheet"
        />
      </Head>
      <div class={"px-4 w-full"}>
        <Component />
      </div>
    </>
  );
}
