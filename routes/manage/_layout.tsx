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
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css"
          integrity="sha384-zh0CIslj+VczCZtlzBcjt5ppRcsAmDnRem7ESsYwWwg3m/OaJ2l4x7YBZl9Kxxib"
          crossorigin="anonymous"
        />
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.js"
          integrity="sha384-Rma6DA2IPUwhNxmrB/7S3Tno0YY7sFu9WSYMCuulLhIqYSGZ2gKCJWIqhBWqMQfh"
          crossorigin="anonymous"
        >
        </script>
        <link
          rel="stylesheet"
          href="/mathquill/mathquill-basic.css"
        />
        <link
          rel="stylesheet"
          href="/mathquill4quill.min.css"
        />
        <script
          defer
          src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"
        >
        </script>
        <script
          defer
          src="/mathquill4quill.min.js"
        >
        </script>

        <script
          defer
          src="/mathquill/mathquill.min.js"
        >
        </script>
      </Head>
      <div class={"px-4 w-full"}>
        <Component />
      </div>
    </>
  );
}
