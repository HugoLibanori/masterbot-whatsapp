import { Options, Dialect } from "sequelize";
import "dotenv/config";

const dialect: Dialect = (process.env.DATABASE_DIALECT as Dialect) || "mysql";

const config: Options = {
  dialect,
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  username: process.env.DATABASE_USERNAME || "root",
  password: process.env.DATABASE_PASSWORD || "123456",
  database: process.env.NOME_DATABASE || "BOT_TESTE",
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
  dialectOptions: {
    timezone: "-03:00",
  },
  timezone: "-03:00",
};

export default config;
