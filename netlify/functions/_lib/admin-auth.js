const crypto = require("crypto");

const ADMIN_COOKIE_NAME = "rivex_admin";
const DEFAULT_ADMIN_MAX_AGE = 60 * 60 * 12;

function getAdminSecret() {
  return (process.env.RIVEX_ADMIN_SECRET || process.env.RIVEX_GATE_SECRET || "").trim();
}

function getAdminEmail() {
  return (process.env.RIVEX_ADMIN_EMAIL || "").trim().toLowerCase();
}

function getAdminCode() {
  return (process.env.RIVEX_ADMIN_CODE || "").trim();
}

function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function createAdminToken(email) {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("Missing RIVEX_ADMIN_SECRET");
  }
  const expiresAt = Date.now() + DEFAULT_ADMIN_MAX_AGE * 1000;
  const payload = `${email}|${expiresAt}|admin`;
  return `${Buffer.from(payload, "utf8").toString("base64url")}.${sign(payload, secret)}`;
}

function parseCookies(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) return acc;
      acc[part.slice(0, separatorIndex)] = part.slice(separatorIndex + 1);
      return acc;
    }, {});
}

function getAdminToken(headers) {
  const cookies = parseCookies(headers.cookie || headers.Cookie || "");
  return cookies[ADMIN_COOKIE_NAME] || "";
}

function verifyAdminToken(token) {
  const secret = getAdminSecret();
  if (!secret || !token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  let payload;
  try {
    payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  } catch (_error) {
    return null;
  }

  const expectedSignature = sign(payload, secret);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  const [email, expiresAtRaw, role] = payload.split("|");
  const expiresAt = Number(expiresAtRaw);
  if (!email || role !== "admin" || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return null;
  }

  return { email, expiresAt };
}

function validateAdminCredentials(email, code) {
  const expectedCode = getAdminCode();
  const expectedEmail = getAdminEmail();

  if (!expectedCode) {
    throw new Error("Missing RIVEX_ADMIN_CODE");
  }

  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (expectedEmail && normalizedEmail !== expectedEmail) {
    return false;
  }

  return String(code || "").trim() === expectedCode;
}

function buildAdminCookie(token) {
  return [
    `${ADMIN_COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${DEFAULT_ADMIN_MAX_AGE}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

function buildClearAdminCookie() {
  return [
    `${ADMIN_COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

module.exports = {
  ADMIN_COOKIE_NAME,
  buildAdminCookie,
  buildClearAdminCookie,
  createAdminToken,
  getAdminCode,
  getAdminEmail,
  getAdminToken,
  validateAdminCredentials,
  verifyAdminToken,
};
