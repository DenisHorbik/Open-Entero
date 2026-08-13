import { createServer } from "node:http";
import {
  chmodSync,
  createReadStream,
  existsSync,
  lstatSync,
  mkdirSync,
  unlinkSync,
} from "node:fs";
import { dirname, extname, join, normalize, sep } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectDir = dirname(dirname(fileURLToPath(import.meta.url)));
const clientDir = join(projectDir, "dist", "client");
const serverEntry = join(projectDir, "dist", "server", "index.js");

if (!existsSync(serverEntry)) {
  throw new Error("Missing dist/server/index.js. Run npm run build:domainby before starting the app.");
}

const workerModule = await import(pathToFileURL(serverEntry).href);
const worker = workerModule.default;
const render = typeof worker === "function" ? worker : worker.fetch.bind(worker);

const mimeTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function clientFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const candidate = normalize(join(clientDir, decoded.replace(/^\/+/, "")));
  if (!candidate.startsWith(clientDir + sep) || !existsSync(candidate)) return null;
  const info = lstatSync(candidate);
  return info.isFile() ? { path: candidate, info } : null;
}

function publicUrl(request) {
  const forwardedProto = String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const protocol = forwardedProto || (process.env.NODE_ENV === "production" ? "https" : "http");
  const host = request.headers["x-forwarded-host"] || request.headers.host || "open.entero.by";
  return `${protocol}://${host}${request.url || "/"}`;
}

async function assetFetch(request) {
  const asset = clientFile(new URL(request.url).pathname);
  if (!asset) return new Response("Not found", { status: 404 });
  const bytes = await import("node:fs/promises").then(({ readFile }) => readFile(asset.path));
  return new Response(bytes, {
    headers: {
      "cache-control": asset.path.includes(`${sep}_next${sep}static${sep}`)
        ? "public, max-age=31536000, immutable"
        : "public, max-age=86400",
      "content-length": String(asset.info.size),
      "content-type": mimeTypes.get(extname(asset.path).toLowerCase()) || "application/octet-stream",
    },
  });
}

const workerEnv = { ASSETS: { fetch: assetFetch } };
const workerContext = { waitUntil() {}, passThroughOnException() {} };

const server = createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(publicUrl(incoming));
    if (url.pathname === "/healthz") {
      outgoing.writeHead(200, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
      outgoing.end("ok");
      return;
    }

    const asset = clientFile(url.pathname);
    if (asset) {
      outgoing.writeHead(200, {
        "cache-control": asset.path.includes(`${sep}_next${sep}static${sep}`)
          ? "public, max-age=31536000, immutable"
          : "public, max-age=86400",
        "content-length": asset.info.size,
        "content-type": mimeTypes.get(extname(asset.path).toLowerCase()) || "application/octet-stream",
      });
      if (incoming.method === "HEAD") outgoing.end();
      else createReadStream(asset.path).pipe(outgoing);
      return;
    }

    const method = incoming.method || "GET";
    const init = { method, headers: incoming.headers };
    if (method !== "GET" && method !== "HEAD") {
      init.body = Readable.toWeb(incoming);
      init.duplex = "half";
    }
    const result = await render(new Request(url, init), workerEnv, workerContext);
    outgoing.statusCode = result.status;
    for (const [name, value] of result.headers) outgoing.setHeader(name, value);
    if (method === "HEAD" || !result.body) {
      outgoing.end();
      return;
    }
    Readable.fromWeb(result.body).pipe(outgoing);
  } catch (error) {
    console.error("Request failed", error);
    if (!outgoing.headersSent) {
      outgoing.writeHead(500, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
    }
    outgoing.end("Internal server error");
  }
});

const socketPath = process.env.SOCKET_PATH || process.env.SOCKET;
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

if (socketPath) {
  mkdirSync(dirname(socketPath), { recursive: true });
  if (existsSync(socketPath)) {
    if (!lstatSync(socketPath).isSocket()) throw new Error(`Refusing to replace non-socket path: ${socketPath}`);
    unlinkSync(socketPath);
  }
}

server.listen(socketPath || port, socketPath ? undefined : host, () => {
  if (socketPath) chmodSync(socketPath, 0o660);
  console.info(`ENTERO listening on ${socketPath || `${host}:${port}`}`);
});

function shutdown() {
  server.close(() => {
    if (socketPath && existsSync(socketPath) && lstatSync(socketPath).isSocket()) unlinkSync(socketPath);
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
