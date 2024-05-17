interface User {
  id: string | number | bigint;
  email: string;
  [k: string]: any;
}

type NullString = string | null;
interface WhereQuery {
  value: string[];
  operator: "LIKE" | "=";
}

interface Error {
  to_string: () => string;
}

interface Result<V, Err = Error | null> {
  Ok: V | null;
  Err: Err;
}
