const {
  buildAdminCookie,
  createAdminToken,
  validateAdminCredentials,
} = require("./_lib/admin-auth");

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "Method not allowed." }),
    };
  }

  try {
    const { email = "", code = "" } = JSON.parse(event.body || "{}");
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!validateAdminCredentials(normalizedEmail, code)) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ ok: false, error: "Admin credentials are invalid." }),
      };
    }

    const token = createAdminToken(normalizedEmail || "admin");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "Set-Cookie": buildAdminCookie(token),
      },
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    console.error("Admin login failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "Admin login unavailable." }),
    };
  }
};
