// Pixel Pit: a Node.js server that serves a static website from the "public" folder.
// Uses only built-in modules: http, fs, path.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

// Content-Type header for each file extension
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

// Turn a URL like "/", "/games" or "/css/style.css" into a file path inside public/
function resolveFile(urlPath) {
  let filePath = path.join(PUBLIC_DIR, decodeURIComponent(urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) return null; // blocks "/../server.js"

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html"); // "/" -> index.html
  } else if (!path.extname(filePath)) {
    filePath += ".html"; // pretty URLs: "/games" -> games.html
  }
  return filePath;
}

function send(res, status, filePath, method) {
  const type = MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": type.startsWith("text/html") ? "no-cache" : "public, max-age=3600",
  });
  if (method === "HEAD") return res.end();
  fs.createReadStream(filePath).pipe(res); // stream the file instead of loading it all in memory
}

const server = http.createServer((req, res) => {
  const started = Date.now();
  res.on("finish", () => console.log(`${req.method} ${req.url} -> ${res.statusCode} (${Date.now() - started} ms)`));

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain", Allow: "GET, HEAD" });
    return res.end("405 Method Not Allowed");
  }

  let filePath;
  try {
    filePath = resolveFile(new URL(req.url, `http://${req.headers.host}`).pathname);
  } catch {
    filePath = null; // malformed URL encoding
  }

  if (filePath === null) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.end("400 Bad Request");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) return send(res, 404, path.join(PUBLIC_DIR, "404.html"), req.method);
    send(res, 200, filePath, req.method);
  });
});

server.listen(PORT, () => {
  console.log(`Pixel Pit is running at http://localhost:${PORT}`);
  console.log(`Serving static files from ${PUBLIC_DIR}`);
});
