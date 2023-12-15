import env from "../libs/env.ts";

const authConfig = () => {
  return {
    table: env("AUTH_TABLE", "users"),
    column: env("AUTH_IDENTITY_COLUMN", "email"),
    password: env("AUTH_PASSWORD_COLUMN", "password"),
    isAdmin: env("AUTH_ADMIN_COLUMN", "is_admin"),
    crypto: env("AUTH_CRYPTOGRAPHY", "bcrypt"),
  };
};

export default authConfig;
