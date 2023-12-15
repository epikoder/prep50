export default function env<T extends string | boolean | number>(
  key: string,
  v: T | undefined,
): T {
  const i = Deno.env.get(key);
  const value = i ?? v;
  switch (typeof v) {
    case "boolean":
      return <T> !!value;
    case "number":
      return <T> parseInt(value?.toString() || "");
    default:
      return <T> <string> value;
  }
}
