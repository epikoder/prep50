// deno-lint-ignore-file
import databaseConfig from "../config/database.ts";
import { COLLECTION_DIR, SCHEMA } from "./constants.ts";
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

import { Knex } from "knex";
import Dex from "https://deno.land/x/dex@1.0.2/mod.ts";

type TupleString3 = [string, string, string];
type QueryRelation = Omit<Attributes & RelationAttribute, "target"> & {
  target: TupleString3;
  field: string;
};

export default class Builder {
  private static builder: Builder;
  private readonly _db: Client;
  private _paginateLimit = 10;
  private readonly _debug: boolean;
  constructor({ debug, client }: { debug?: boolean; client: Client }) {
    this._debug = !!debug;
    this._db = client;
  }

  public static async init(
    config: ReturnType<typeof databaseConfig> & { debug?: boolean },
  ): Promise<Client> {
    if (this.builder) return this.builder._db;
    const { debug, ...c } = config;
    const client = await new Client().connect({
      ...c,
      poolSize: 2
    });
    await client.execute(`SELECT uuid()`);
    Builder.builder = new Builder({ debug: debug, client });
    return client;
  }

  public static async end() {
    await this.builder._db.close();
  }

  public static instance() {
    if (!this.builder) throw new Error("Builder not initialized");
    return this.builder;
  }

  private _log(...a: Parameters<Console["log"]>) {
    if (this._debug) {
      console.log(...a);
    }
  }

  private _builder(): Knex {
    return Dex({ client: "mysql2" });
  }

  async count(schema: Schema) {
    let query = this._builder().queryBuilder().table(schema.table).count("id");
    this._log("Count --- ", query.toQuery());
    return await this._db.execute(query.toQuery());
  }

  async create(
    schema: Schema,
    params: Record<string, any>,
  ): Promise<number> {
    let query = this._builder().queryBuilder().table(schema.table);
    query = query.insert(params);
    console.log("Create --- ", query.toSQL().sql, params);
    const result = await this._db.execute(query.toQuery());
    console.log(result);
    return result.lastInsertId!;
  }

  async createRelation(
    tableName: string,
    params: Record<string, any>,
  ): Promise<boolean> {
    let query = this._builder().queryBuilder().table(tableName);
    query = query.insert(params);
    console.log("CreateRelation --- ", query.toSQL().sql);
    const result = await this._db.execute(query.toQuery());
    return result.affectedRows! > 0;
  }

  async update(
    schema: Schema,
    id: any,
    params: Record<string, any>,
  ): Promise<boolean> {
    let query = this._builder().queryBuilder().table(schema.table);
    let relations = this._relationBinding(schema);
    query = this._selectRelation(query, schema, relations);
    query = this._joinRelation(query, schema, relations);
    query = this._polyJoinRelation(query, schema);
    let mappedParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (key.includes(".")) {
        mappedParams[key] = value;
        continue;
      }
      mappedParams[`${schema.table}.${key}`] = value;
    }

    this._log("Update", query.toQuery(), params);
    let result = await this._db.execute(
      query
        .update(mappedParams)
        .where(`${schema.table}.${schema.uniqueId || "id"}`, id).toQuery(),
      this._toArray(params),
    );
    return (result.affectedRows || 0) > 0;
  }

  async get(
    schema: Schema,
    params: Record<string, string>,
  ): Promise<DBResult | undefined> {
    let query = this._builder().queryBuilder().table(schema.table);
    let relations = this._relationBinding(schema);
    query = this._select(query, schema, true);
    query = this._selectRelation(query, schema, relations);
    query = this._joinRelation(query, schema, relations);
    query = this._polyJoinRelation(query, schema);

    for (let p of Object.entries(params)) {
      query.where(p[0], p[1]);
    }
    this._log("get----- :", query.toQuery());
    let result = await this._db.execute(
      query.toQuery(),
      this._toArray(params),
    );
    return result.rows?.at(0);
  }

  async getAll(
    schema: Schema,
    params?: Record<string, string>,
    usePagination: boolean = true,
    currentPage?: number,
  ) {
    let query = this._builder().queryBuilder().table(schema.table);
    let relations = this._relationBinding(schema);
    query = this._select(query, schema);
    query = this._selectRelation(query, schema, relations);
    query = this._joinRelation(query, schema, relations);
    query = this._polyJoinRelation(query, schema);
    for (let p of Object.entries(params || {})) {
      query.where(`${p[0]}`, p[1]);
    }

    if (!usePagination) {
      this._log("getAll ---- ", query.toQuery());
      const result = await this._db.execute(
        query.toQuery(),
        this._toArray(params),
      );
      return {
        data: result.rows || [],
        pagination: {},
      };
    }
    return this._paginate(query, schema, params, {
      currentPage: currentPage || 1,
      perPage: 100,
    });
  }

  async delete(
    schema: Schema,
    id: string | number,
  ): Promise<boolean> {
    let query = this._builder().queryBuilder().table(schema.table);
    query = query.where(schema.uniqueId || "id", id).delete();
    console.log("Delete --- ", query.toSQL().sql);
    const result = await this._db.execute(query.toQuery());
    console.log(result);
    return result.affectedRows! > 0;
  }

  async deleteRelations(
    tableName: string,
    params: Record<string, any>,
  ): Promise<boolean> {
    let query = this._builder().queryBuilder().table(tableName);
    query = query.where(params).delete();
    console.log("DeleteRelation --- ", query.toSQL().sql);
    const result = await this._db.execute(query.toQuery());
    return result.affectedRows! > 0;
  }

  private _toArray(params?: Record<string, any>) {
    return Object.values(params || {}).map((v) => v);
  }

  private _select<T extends Knex.QueryBuilder>(
    builder: T,
    schema: Schema,
    allColumns: boolean = false,
  ): T {
    let select: string[] = [];
    let columns = this._columns(schema, allColumns);
    let actions = this._actions(schema);
    for (const c of columns) {
      select = select.concat(`${schema.table}.${c}`);
    }
    for (const a of actions) {
      select = select.concat(
        `${schema.table}.${schema.uniqueId || "id"} as ${
          a.displayName || a.field
        }`,
      );
    }
    this._log("_select", builder.toQuery());
    return <T> builder.select(select);
  }

  private _selectRelation<T extends Knex.QueryBuilder>(
    builder: T,
    schema: Schema,
    rel: QueryRelation[],
  ): T {
    for (const r of rel) {
      if (r.relation.type === "oneToMany") {
        let field = `${
          r.relation.reference === "forward" ? r.target[0] : schema.table
        }.${
          r.relation.reference === "forward"
            ? r.relation.column || r.field
            : r.relation.column
        } as ${r.displayName || r.field}`;
        builder.select(field);
      }
    }
    this._log("_selectRelation", builder.toQuery());
    return <T> builder;
  }

  private _joinRelation<T extends Knex.QueryBuilder>(
    builder: T,
    _: Schema,
    rel: QueryRelation[],
  ): T {
    for (const r of rel) {
      if (
        r.relation.type === "oneToMany" &&
        r.relation.reference === "forward"
      ) {
        builder[r.join ? r.join : "leftJoin"](...r.target);
      }
    }
    return builder;
  }

  private _actions(schema: Schema) {
    let s: (Attributes & ActionAttribute)[] = [];
    for (const a of schema.attributes) {
      if (a.type === "action") s = s.concat(a);
    }
    return s;
  }

  private _columns(schema: Schema, allColumns: boolean = false): string[] {
    let s: string[] = [];
    for (const a of schema.attributes) {
      if (
        (a.type === "relation" &&
          a.relation.type === "oneToMany" &&
          a.relation.reference == "forward" &&
          allColumns) ||
        (a.type !== "relation" &&
          // a.type !== "enum" &&
          a.type !== "join-relation" &&
          a.type !== "action")
      ) {
        s = s.concat(a.field);
      }
    }
    return s;
  }

  private _relationBinding(schema: Schema): QueryRelation[] {
    let r: QueryRelation[] = [];
    for (let a of schema.attributes) {
      if (a.type === "relation" && a.relation.type === "oneToMany") {
        let t = a.target.split(":");
        if (t.length !== 2) {
          this._throwInvalidTarget(schema.name, a.field);
        }
        t[1] = a.target.replace(":", ".");
        const target: QueryRelation["target"] = [
          ...(t as [string, string]),
          `${schema.table}.${
            a.relation.reference == "backward" ? a.relation.column : a.field
          }`,
        ];
        r = r.concat({ ...a, target });
      }
    }
    return r;
  }

  private _polyJoinRelation<T extends Knex.QueryBuilder>(
    builder: T,
    schema: Schema,
  ): T {
    let select: Map<string, Schema["attributes"][number]> = new Map();
    for (const attr of schema.attributes) {
      if (attr.type !== "join-relation") continue;

      let field = "";
      if (attr.relation === "belongsTo" || attr.relation === "belongsToMany") {
        field = `${attr.tableName}.${attr.column || attr.foreignKey || "id"}${
          attr.displayName ? " as " + attr.displayName : ""
        }`;
        select.set(field, attr);
        if (attr.pivot) {
          const f = `${attr.pivot.table}.${
            attr.pivot.column || attr.pivot.key || "id"
          }${attr.pivot.displayName ? " as " + attr.pivot.displayName : ""}`;
          builder.select(f);
        }
      } else {
        field = `${schema.table}.${schema.uniqueId || "id"} AS ${
          attr.displayName || attr.field
        }`;
        // TODO :: HAS-
      }

      builder.select(field);
    }

    for (
      const [_, attr] of select.entries() as Iterable<
        [string, Attributes & JoinRelationAttribute]
      >
    ) {
      builder
        .leftJoin(
          attr.joinTableName,
          `${attr.joinTableName}.${attr.joinForeignKey}`,
          `${schema.table}.${attr.foreignKey || "id"}`,
        )
        .leftJoin(
          attr.tableName,
          `${attr.joinTableName}.${attr.joinReferenceKey}`,
          `${attr.tableName}.${attr.referenceKey || "id"}`,
        );
      if (attr.pivot) {
        builder.leftJoin(
          attr.pivot.joinTable,
          `${attr.pivot.joinTable}.${attr.pivot.joinReferenceKey}`,
          `${attr.tableName}.${attr.foreignKey || "id"}`,
        )
          .leftJoin(
            attr.pivot.table,
            `${attr.pivot.joinTable}.${attr.pivot.joinReferenceKey}`,
            `${attr.pivot.table}.${attr.pivot.key || "id"}`,
          );
      }
    }
    this._log("_selectJoinRelation", builder.toQuery());
    return builder;
  }

  private async _openSchama(collection: string): Promise<Schema> {
    const schema: Schema = JSON.parse(
      await Deno.readTextFile(COLLECTION_DIR + collection + SCHEMA),
    );
    return schema;
  }

  private _throwInvalidTarget = (name: string, field: string) => {
    throw new Error(
      `Schema: ${name} - field: ${field} - target must be of table:foriegnKey`,
    );
  };

  private async _paginate(
    query: Knex.QueryBuilder,
    schema: Schema,
    params: Record<string, string> = {},
    {
      perPage = 10,
      currentPage = 1,
      isFromStart = false,
      isLengthAware = true,
    },
  ) {
    if (isNaN(perPage)) {
      throw new Error("Paginate error: perPage must be a number.");
    }

    if (isNaN(currentPage)) {
      throw new Error("Paginate error: currentPage must be a number.");
    }

    if (typeof isFromStart !== "boolean") {
      throw new Error("Paginate error: isFromStart must be a boolean.");
    }

    if (typeof isLengthAware !== "boolean") {
      throw new Error("Paginate error: isLengthAware must be a boolean.");
    }

    const shouldFetchTotals = isLengthAware || currentPage === 1 || isFromStart;
    let pagination: Record<string, any> = {};
    let countQuery: Knex.QueryBuilder | null = null;

    if (currentPage < 1) {
      currentPage = 1;
    }

    const offset = isFromStart ? 0 : (currentPage - 1) * perPage;
    const limit = isFromStart ? perPage * currentPage : perPage;

    if (shouldFetchTotals) {
      countQuery = this._builder().queryBuilder().table(schema.table)
        .count("* as total")
        .from(query.clone().offset(0).clearOrder().as("count__query__"))
        .first()
        .debug(this._debug);
    }

    if (shouldFetchTotals) {
      const countResult = (await this._db.execute(countQuery!.toQuery())).rows
        ?.at(0);
      const total = +(countResult.TOTAL || countResult.total || 0);
      const lastPage = Math.ceil(total / perPage);
      pagination = {
        total,
        lastPage,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage < lastPage ? currentPage + 1 : null,
      };
    }

    query.offset(offset).limit(limit);
    this._log("paginate ---- ", query.toQuery(), params, offset, limit);
    const result = await this._db.execute(
      query.toQuery(),
      this._toArray(params).concat(limit),
    );
    pagination = {
      ...pagination,
      perPage,
      currentPage,
      from: offset,
      to: offset + (result.rows?.length || 0),
    };
    return { data: result.rows || [], pagination };
  }
}
