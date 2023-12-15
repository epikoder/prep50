import { COLLECTION_DIR, CONFIG, SCHEMA } from "./libs/constants.ts";
import Builder from "./libs/builder.ts";
import databaseConfig from "./config/database.ts";
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
import authConfig from "./config/auth.ts";
import Dex from "https://deno.land/x/dex@1.0.2/mod.ts";
import { Knex } from "knex";
import Hash from "./libs/hash.ts";

export class AppContext {
  private static context: AppContext;
  private _schema: Map<string, Schema>;
  private _config: Map<string, RelationConfig>;
  private _client: Client;

  public constructor(
    { schema, config, client }: {
      schema: Map<string, Schema>;
      config: Map<string, RelationConfig>;
      client: Client;
    },
  ) {
    this._schema = schema;
    this._config = config;
    this._client = client;
  }

  public static async init() {
    const schema = await this.loadSchema();
    const config = await this.loadConfig();
    const client = await Builder.init({
      ...databaseConfig(),
      debug: Deno.env.get("NODE_ENV") === "development",
    })!;
    AppContext.context = new AppContext({ schema, config, client });
    console.log("App context initialized successfully!");
  }

  public static instance() {
    if (this.context) return this.context;
    else throw new Error("Context is not initialized!");
  }

  public schema() {
    return this._schema;
  }

  public config() {
    return this._config;
  }

  public async auth(
    { username, password }: { username?: string; password?: string },
  ): Promise<User | undefined> {
    const cfg = authConfig();
    const query = (Dex({ client: "mysql2" }) as Knex.QueryBuilder).table(
      cfg.table,
    ).select(
      "*",
    ).where(cfg.column, username).where(cfg.isAdmin, 1);

    const result = await this._client.execute(
      query.toQuery(),
      [
        username,
      ],
    );
    const user = result.rows?.at(0) as User | undefined;
    if (!user || !Hash.checkHash(password, user[cfg.password])) {
      return;
    }
    return user;
  }

  private static async loadSchema() {
    const schema: Map<string, Schema> = new Map();
    for await (const m of Deno.readDir(COLLECTION_DIR)) {
      if (m.isDirectory) {
        const sc: Schema = JSON.parse(
          await Deno.readTextFile(COLLECTION_DIR + m.name + SCHEMA),
        );
        schema.set(m.name.toLowerCase(), sc);
      }
    }
    return schema;
  }

  private static async loadConfig() {
    const config: Map<string, RelationConfig> = new Map();
    for await (const m of Deno.readDir(COLLECTION_DIR)) {
      if (m.isDirectory) {
        const c: RelationConfig = JSON.parse(
          await Deno.readTextFile(COLLECTION_DIR + m.name + CONFIG),
        );
        config.set(m.name.toLowerCase(), c);
      }
    }
    return config;
  }
}
