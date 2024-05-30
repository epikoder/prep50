import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import { AppContext } from "./app.context.ts";

if (!Deno.args.includes("build")) { await AppContext.init(); }
export default defineConfig({
  plugins: [tailwind()],
});
