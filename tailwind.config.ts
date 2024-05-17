import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components,libs}/**/*.{ts,tsx}",
  ],
} satisfies Config;
