import postgres from "https://deno.land/x/postgresjs/mod.js";
import databaseConfig from "../config/database.ts";

export enum TLSMode {
    DISABLED = "disabled",
    VERIFY_IDENTITY = "verify_identity",
}
export interface TLSConfig {
    /** mode of tls. only support disabled and verify_identity now*/
    mode?: TLSMode;
    /** A list of root certificates (must be PEM format) that will be used in addition to the
     * default root certificates to verify the peer's certificate. */
    caCerts?: string[];
}

export interface ClientConfig {
    /** Database hostname */
    hostname?: string;
    /** Database UNIX domain socket path. When used, `hostname` and `port` are ignored. */
    socketPath?: string;
    /** Database username */
    username?: string;
    /** Database password */
    password?: string;
    /** Database port */
    port?: number;
    /** Database name */
    db?: string;
    /** Whether to display packet debugging information */
    debug?: boolean;
    /** Connection read timeout (default: 30 seconds) */
    timeout?: number;
    /** Connection pool size (default: 1) */
    poolSize?: number;
    /** Connection pool idle timeout in microseconds (default: 4 hours) */
    idleTimeout?: number;
    /** charset */
    charset?: string;
    /** tls config */
    tls?: TLSConfig;
}

export interface FieldInfo {
    catalog: string;
    schema: string;
    table: string;
    originTable: string;
    name: string;
    originName: string;
    encoding: number;
    fieldLen: number;
    fieldType: number;
    fieldFlag: number;
    decimals: number;
    defaultVal: string;
}
export type ExecuteResult = {
    affectedRows?: number;
    lastInsertId?: number;
    fields?: FieldInfo[];
    rows?: any[];
    iterator?: any;
};

export default class DBClient {
    constructor(config: ClientConfig) {
        this._inner = postgres(config);
    }
    private _inner: ReturnType<typeof postgres>;

    private _ensurePgSql(sql: string) {
        let counter = 1;
        return sql.replace(/\?/g, () => `$${counter++}`);
    }

    private _cleanParams(sql: string, params?: any[]): any[] {
        if (!params) return [];
        const match = sql.match(/\$/g);
        return match ? params.slice(0, match.length) : [];
    }

    async query(sql: string, params?: any[]): Promise<ExecuteResult["rows"]> {
        sql = this._ensurePgSql(sql);
        const _params = this._cleanParams(sql, params);

        // console.log("QUERY", sql, _params);
        const result = await this._inner.unsafe(sql, _params);
        return [...result.values()];
    }

    async execute(sql: string, params?: any[]): Promise<ExecuteResult> {
        sql = this._ensurePgSql(sql);
        const _params = this._cleanParams(sql, params);

        // console.log("EXEC", sql, _params);
        const result = await this._inner.unsafe(sql, _params);
        return {
            affectedRows: result.count,
            rows: [...result.values()],
            lastInsertId: sql.includes("insert") ? result.at(0)?.id : undefined,
        } satisfies ExecuteResult;
    }

    get sql() {
        return this._inner;
    }
}

Deno.test(async function testDBClient() {
    const config = databaseConfig();
    const sql = postgres(config);
    try {
        await sql`SELECT gen_random_uuid();`;
        sql.end();
    } catch (error) {
        console.log(error);
    }
});
