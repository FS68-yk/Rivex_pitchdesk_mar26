const { addCode, deleteCode, getCodes, toggleCode } = require("./_lib/admin-data");
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

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: "Method not allowed." }),
    };
  }

  try {
    const { action = "", codeId = "", code = "", label = "", active = true } = JSON.parse(event.body || "{}");
    let codes;

    if (action === "add") {
      codes = await addCode(event, { code, label });
    } else if (action === "toggle") {
      codes = await toggleCode(event, codeId, Boolean(active));
    } else if (action === "delete") {
      codes = await deleteCode(event, codeId);
    } else {
      codes = await getCodes(event);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({ ok: true, codes }),
    };
  } catch (error) {
    console.error("Admin code action failed:", error);
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: error.message || "Code action failed." }),
    };
  }
};
