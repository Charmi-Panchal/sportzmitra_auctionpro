const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

console.log("DB CONFIG:", {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || "3306",
  user: process.env.DB_USER || "root",
  database: process.env.DB_NAME || "sportzmitra_auction",
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "sportzmitra@123",
  database: process.env.DB_NAME || "sportzmitra_auction",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 20),
  queueLimit: 0,
  decimalNumbers: true,
});

module.exports = pool;
