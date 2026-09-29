import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import mysql from "mysql2/promise";

nextEnv.loadEnvConfig(process.cwd());

const uri = process.env.DATABASE_URL;
if (!uri) {
  console.error("Defina DATABASE_URL antes de executar a migração.");
  process.exit(1);
}

const schema = await readFile(new URL("../database/schema.sql", import.meta.url), "utf8");
const connection = await mysql.createConnection({ uri, multipleStatements: true });
try {
  await connection.query(schema);
  const [tables] = await connection.query("SHOW TABLES");
  console.log("Schema aplicado. Tabelas:", tables.map((row) => Object.values(row)[0]).join(", "));
} finally {
  await connection.end();
}
