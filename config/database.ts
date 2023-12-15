import env from "../libs/env.ts";

const databaseConfig = () => {
  return {
    username: env("DATABASE_USERNAME", "root"),
    password: env("DATABASE_PASSWORD", ""),
    db: env("DATABASE_NAME", "prep50"),
    hostname: env("DATABASE_HOST", "localhost"),
    port: env("DATABASE_PORT", 3306),
    acquireConnectionTimeout: env("DATABASE_CONNECTION_TIMEOUT", 60000),
  };
};
export default databaseConfig;
