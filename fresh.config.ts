import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import { AppContext } from "./app.context.ts";

await AppContext.init();
export default defineConfig({
  plugins: [tailwind()],
});
