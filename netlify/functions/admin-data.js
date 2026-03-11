const { getAnalytics, getCodes, summarizeAnalytics } = require("./_lib/admin-data");
const { getAdminToken, verifyAdminToken } = require("./_lib/admin-auth");

exports.handler = async function handler(event) {
  const session = verifyAdminToken(getAdminToken(event.headers || {}));
  if (!session) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "Unauthorized." }),
    };
  }

  try {
    const analytics = await getAnalytics(event);
    const codes = await getCodes(event);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        ok: true,
        admin: session.email,
        analytics: summarizeAnalytics(analytics),
        codes,
      }),
    };
  } catch (error) {
    console.error("Admin data failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "Unable to load admin data." }),
    };
  }
};
