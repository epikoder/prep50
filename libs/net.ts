
type _ = number | string | boolean
type Query<T> = Record<string, _ | T[]>
export default class Net {
  private static __instance: Net | undefined = undefined;
  private baseUrl: string = "";

  static get instance(): Net {
    if (Net.__instance == undefined) {
      Net.__instance = new Net();
      Net.__instance.baseUrl = "127.0.0.1:8000/";
    }
    return this.__instance!;
  }

  formatQuery = <T = _>(
    url: string,
    params: T | undefined,
  ): string => {
    if (!params) return encodeURI(url);
    let query = "";
    for (const k in params) {
      if (typeof params[k] === "undefined") continue;
      if (typeof params[k] === "object") {
        for (const v of Object.values(params[k]!)) {
          query += `&${k}=${v}`;
        }
      } else {
        query += `&${k}=${typeof params[k] === "boolean" ? (params[k] ? 1 : 0) : params[k]
          }`;
      }
    }
    query = encodeURI(`${url}?${query}`);
    return query;
  };

  getReq = async <T>(
    route: string,
    params?: Query<T>,
    config?: RequestInit,
  ): Promise<Result<T>> => {
    try {
      const res = await fetch(
        this.formatQuery(route, params),
        {
          ...config,
          method: "GET",
        },
      );
      if (res.status != 200) throw new Error(await res.text());

      const json = await res.json() as T;
      return {
        Ok: json,
        Err: null,
      };
    } catch (error) {
      return {
        Ok: null,
        Err: error,
      };
    }
  };

  postReq = async <T>(
    route: string,
    body?: Query<T>,
    params?: Query<T>,
    config?: RequestInit,
  ): Promise<Result<T>> => {
    try {
      const res = await fetch(
        this.formatQuery(route, params),
        {
          ...config,
          method: "POST",
          body: JSON.stringify(body),
        },
      );
      if (res.status != 200) throw new Error(await res.text());

      const json = await res.json() as T;
      return {
        Ok: json,
        Err: null,
      };
    } catch (error) {
      return {
        Ok: null,
        Err: error,
      };
    }
  };

  putReq = async <T>(
    route: string,
    body?: Query<T>,
    params?: Query<T>,
    config?: RequestInit,
  ): Promise<Result<T>> => {
    try {
      const res = await fetch(
        this.formatQuery(route, params),
        { ...config, method: "PUT", body: JSON.stringify(body) },
      );
      if (res.status != 200) throw new Error(await res.text());

      const json = await res.json() as T;
      return {
        Ok: json,
        Err: null,
      };
    } catch (error) {
      return {
        Ok: null,
        Err: error,
      };
    }
  };

  deleteReq = async <T>(
    route: string,
    params?: Query<T>,
    config?: RequestInit,
  ): Promise<Result<T>> => {
    try {
      const res = await fetch(
        this.formatQuery(route, params),
        { ...config, method: "DELETE" },
      );
      if (res.status != 200) throw new Error(await res.text());

      const json = await res.json() as T;
      return {
        Ok: json,
        Err: null,
      };
    } catch (error) {
      return {
        Ok: null,
        Err: error,
      };
    }
  };
}
