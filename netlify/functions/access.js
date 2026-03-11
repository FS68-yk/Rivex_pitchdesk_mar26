const {
  buildSessionCookie,
  createToken,
  getMaxAge,
  isValidEmail,
} = require("./_lib/gate");
const { findActiveCode, recordEvent, touchCodeUse } = require("./_lib/admin-data");

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "Method not allowed." }),
    };
  }

  try {
    const { email = "", inviteCode = "" } = JSON.parse(event.body || "{}");
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedCode = String(inviteCode).trim();

    if (!isValidEmail(normalizedEmail)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ok: false, error: "Please enter a valid email address." }),
      };
    }

    const matchedCode = await findActiveCode(event, normalizedCode);
    if (!matchedCode) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ok: false, error: "Invitation code is invalid." }),
      };
    }

    const maxAge = getMaxAge();
    const token = createToken(normalizedEmail, maxAge);
    const ip = event.headers["x-nf-client-connection-ip"] || event.headers["x-forwarded-for"] || null;
    const userAgent = event.headers["user-agent"] || null;

    await touchCodeUse(event, normalizedCode);
    await recordEvent(event, {
      type: "login_success",
      email: normalizedEmail,
      code: normalizedCode,
      ip,
      userAgent,
      path: "/.netlify/functions/access",
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "Set-Cookie": buildSessionCookie(token, maxAge),
      },
      body: JSON.stringify({ ok: true, redirect: "/deck" }),
    };
  } catch (error) {
    console.error("RIVEX access validation failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "Access validation is temporarily unavailable." }),
    };
  }
};
