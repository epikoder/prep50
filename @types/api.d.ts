// deno-lint-ignore no-explicit-any
interface Api<T = { [key: string]: any }> {
  status: "success" | "failed";
  data?: T;
  $meta?: { [key: string]: string };
}

interface UpdateRequest<T> {
  data: T;
  action: 'update' | 'delete';
}