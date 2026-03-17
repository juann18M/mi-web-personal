import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: mysql.Pool | undefined;
}

export const db =
  global.mysqlPool ??
  mysql.createPool({
    host: "localhost",
    user: "root",
    password: "2026",
    database: "blacks_store",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== "production") {
  global.mysqlPool = db;
}