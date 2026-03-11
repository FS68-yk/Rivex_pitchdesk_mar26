const fs = require("fs/promises");
const path = require("path");

const { getCookieToken, verifyToken } = require("./_lib/gate");

const assetsRoot = path.resolve(process.cwd(), "assets");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function resolveAssetPath(requestPath) {
  const cleaned = String(requestPath || "").replace(/^\/+/, "");
  if (!cleaned) {
    return null;
  }

  const absolutePath = path.resolve(assetsRoot, cleaned);
  if (!absolutePath.startsWith(assetsRoot + path.sep)) {
    return null;
  }

  return absolutePath;
}

exports.handler = async function handler(event) {
  try {
    const token = getCookieToken(event.headers || {});
    if (!verifyToken(token)) {
      return {
        statusCode: 302,
        headers: {
          Location: "/",
          "Cache-Control": "no-store",
        },
        body: "",
      };
    }

    const assetPath = String(event.path || "").replace(/^\/protected-assets\/?/, "");
    const filePath = resolveAssetPath(assetPath);

    if (!filePath) {
      return { statusCode: 400, body: "Invalid asset path." };
    }

    const fileBuffer = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
      body: fileBuffer.toString("base64"),
    };
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return { statusCode: 404, body: "Asset not found." };
    }
    console.error("Protected asset delivery failed:", error);
    return { statusCode: 500, body: "Protected asset unavailable." };
  }
};
