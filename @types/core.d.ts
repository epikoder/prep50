// deno-lint-ignore-file no-explicit-any
interface Schema {
  name: string;
  table: string;
  uniqueId: string;
  node?: number;
  attributes: SchemaAttribute[];
}

type SchemaAttribute =
  & Attributes
  & (
    | CommonAttributes
    | EnumAttribute
    | RelationAttribute
    | JoinRelationAttribute
    | ActionAttribute
    | MediaAttribute
  );

interface SchemaRelation {
  table: string;
  field: string;
}

interface Attributes {
  field: string;
  hidden?: boolean;
  displayName?: string;
}

interface CommonAttributes {
  type:
    | "int"
    | "bigint"
    | "string"
    | "uuid"
    | "text"
    | "boolean"
    | "date"
    | "email";
  searchable?: boolean;
}
interface MediaAttribute {
  type: "image" | "video" | "audio" | "file";
}
interface EnumAttribute {
  type: "enum";
  values: Record<string, any>;
}

interface RelationAttribute {
  type: "relation";
  join?: "leftJoin" | "join";
  target: string;
  collection: string;
  relation: (TableRelation | TableRelationWithReference) & {
    column?: string;
  };
}

interface JoinRelationAttribute {
  type: "join-relation";
  relation: Relationship;
  collection: string;
  tableName: string;
  joinTableName: string;
  joinForeignKey: string;
  joinReferenceKey: string;
  foreignKey?: string;
  referenceKey?: string;
  column: string;
  pivot?: {
    table: string;
    key?: string;
    joinKey: string;
    joinTable: string;
    referenceKey?: string;
    joinReferenceKey: string;
    column: string;
    displayName?: string;
  };
}

type Relationship = "hasOne" | "hasMany" | "belongsTo" | "belongsToMany";

interface TableRelation {
  type: "oneToOne" | "manyToMany";
}

interface TableRelationWithReference {
  type: "oneToMany";
  reference: "forward" | "backward";
}

interface ActionAttribute {
  type: "action";
  action: "edit" | "delete" | "view";
  displayName?: string;
}

interface Pagination {
  total: number;
  lastPage: number;
  prevPage: number | null;
  nextPage: number | null;
  perPage: number;
  currentPage: number;
  from: number;
  to: number;
}

type DBResult = Record<string, any>;

interface RelationConfig {
  [field: string]: RConfigAttribute;
}

interface RConfigAttribute {
  key?: string;
  field: string;
  node: number;
  pivot?: {
    tableName: string;
    joinTableName: string;
    joinForeignKey: string;
    joinReferenceKey: string;
    foreignKey?: string;
    referenceKey?: string;
  };
  type: "relation" | "join-relation";
  collection: string;
  parent?: string;
  column: string;
}

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
