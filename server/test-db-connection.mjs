import pg from "pg";
import dns from "dns";
import net from "net";
import tls from "tls";
import { URL } from "url";
import dotenv from "dotenv";

dotenv.config();

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const parsed = new URL(raw);
console.log("=== DATABASE_URL Diagnosis ===");
console.log("host:", parsed.hostname);
console.log("port:", parsed.port || "5432");
console.log("database:", parsed.pathname.slice(1));
console.log("user:", parsed.username);
console.log("password present:", !!parsed.password);
console.log("sslmode:", parsed.searchParams.get("sslmode"));
console.log("channel_binding:", parsed.searchParams.get("channel_binding"));

async function checkDns() {
  console.log("\n=== DNS Resolution ===");
  try {
    const addresses = await dns.promises.lookup(parsed.hostname, { all: true });
    console.log("DNS resolved:", addresses.map(a => `${a.family} ${a.address}`).join(", "));
  } catch (err) {
    console.error("DNS resolution failed:", err.message);
  }
}

function checkTcp(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    console.log("\n=== TCP Connection Test ===");
    const socket = net.createConnection({ host: parsed.hostname, port: Number(parsed.port || 5432) });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`TCP connection timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    socket.on("connect", () => {
      clearTimeout(timer);
      console.log("TCP connection established");
      socket.end();
      resolve();
    });
    socket.on("error", (err) => {
      clearTimeout(timer);
      console.error("TCP connection error:", err.message);
      reject(err);
    });
  });
}

function checkTls(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    console.log("\n=== TLS Handshake Test ===");
    const socket = tls.connect({
      host: parsed.hostname,
      port: Number(parsed.port || 5432),
      rejectUnauthorized: false,
    });
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`TLS handshake timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    socket.on("secureConnect", () => {
      clearTimeout(timer);
      console.log("TLS handshake successful");
      console.log("cipher:", socket.getCipher()?.name);
      console.log("protocol:", socket.getProtocol());
      socket.end();
      resolve();
    });
    socket.on("error", (err) => {
      clearTimeout(timer);
      console.error("TLS handshake error:", err.message);
      reject(err);
    });
  });
}

async function testQuery(poolConfig, label) {
  console.log(`\n=== ${label} ===`);
  const pool = new pg.Pool(poolConfig);
  try {
    const start = Date.now();
    const result = await pool.query("SELECT NOW() AS now");
    console.log(`Query success in ${Date.now() - start}ms:`, result.rows[0]);
  } catch (err) {
    console.error(`Query failed after ${Date.now() - start}ms:`, err.code, err.message);
  } finally {
    await pool.end().catch(() => {});
  }
}

async function main() {
  await checkDns();
  await checkTcp(5000);
  await checkTls(5000);

  await testQuery({
    connectionString: raw,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
    statement_timeout: 5000,
    keepAlive: true,
  }, "Direct pg Pool (5s timeouts)");

  await testQuery({
    connectionString: raw,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
    statement_timeout: 10000,
    keepAlive: true,
  }, "Direct pg Pool (10s timeouts)");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
