import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function ManageLayout({ Component, state }: PageProps) {
  return (
    <>
      <Head>
        <script
          src="/tinymce/tinymce.min.js"
          defer
        >
        </script>
      </Head>
      <div class={"px-4 w-full"}>
        <Component />
      </div>
    </>
  );
}
