export default function env<T = string | boolean | number>(
  key: string,
  v: T | undefined,
) {
  const i = Deno.env.get(key);
  if (!i && v) return v;
  return <T> i;
}
