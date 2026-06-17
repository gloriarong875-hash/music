const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = 8765;
const ROOT_DIR = path.resolve(__dirname, "..", "..");

const MIME_TYPES = {
  ".aac": "audio/aac",
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".geojson": "application/geo+json; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".webp": "image/webp"
};

function send(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, headers);
  response.end(body);
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function resolveRequestPath(urlPathname) {
  const decodedPath = safeDecode(urlPathname || "/");
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[\\/])+/, "");
  let targetPath = path.join(ROOT_DIR, normalizedPath);

  if (decodedPath.endsWith("/") || !path.extname(targetPath)) {
    targetPath = path.join(targetPath, "index.html");
  }

  const relativePath = path.relative(ROOT_DIR, targetPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return targetPath;
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${HOST}:${PORT}`);
  const targetPath = resolveRequestPath(requestUrl.pathname);

  if (!targetPath) {
    send(response, 403, "Forbidden");
    return;
  }

  fs.stat(targetPath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      send(response, 404, "Not Found");
      return;
    }

    const extension = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache"
    });

    const stream = fs.createReadStream(targetPath);
    stream.on("error", () => {
      if (!response.headersSent) {
        send(response, 500, "Internal Server Error");
      } else {
        response.destroy();
      }
    });
    stream.pipe(response);
  });
});

server.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    console.error(`Static server already running at http://${HOST}:${PORT}`);
    process.exit(0);
  }

  console.error(error);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Static server ready at http://${HOST}:${PORT}`);
});
