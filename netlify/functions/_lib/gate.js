const crypto = require("crypto");

const COOKIE_NAME = "rivex_gate";
const DEFAULT_MAX_AGE = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.RIVEX_GATE_SECRET;
  if (!secret) {
    throw new Error("Missing RIVEX_GATE_SECRET");
  }
  return secret;
}

function getInviteCode() {
  const code = (process.env.RIVEX_INVITE_CODE || "").trim();
  if (!code) {
    throw new Error("Missing RIVEX_INVITE_CODE");
  }
  return code;
}

function getMaxAge() {
  const raw = Number.parseInt(process.env.RIVEX_GATE_MAX_AGE || "", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_MAX_AGE;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function toBase64Url(input) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64Url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function createToken(email, maxAge) {
  const expiresAt = Date.now() + maxAge * 1000;
  const payload = `${email}|${expiresAt}`;
  const signature = sign(payload, getSecret());
  return `${toBase64Url(payload)}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  let payload;
  try {
    payload = fromBase64Url(encodedPayload);
  } catch (_error) {
    return null;
  }

  const expectedSignature = sign(payload, getSecret());
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  const [email, expiresAtRaw] = payload.split("|");
  const expiresAt = Number(expiresAtRaw);

  if (!email || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return null;
  }

  return { email, expiresAt };
}

function parseCookies(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) {
        return acc;
      }
      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
}

function getCookieToken(headers) {
  const cookies = parseCookies(headers.cookie || headers.Cookie || "");
  return cookies[COOKIE_NAME] || "";
}

function buildSessionCookie(token, maxAge) {
  return [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

function buildClearCookie() {
  return [
    `${COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

module.exports = {
  COOKIE_NAME,
  buildClearCookie,
  buildSessionCookie,
  createToken,
  getCookieToken,
  getInviteCode,
  getMaxAge,
  isValidEmail,
  verifyToken,
};
