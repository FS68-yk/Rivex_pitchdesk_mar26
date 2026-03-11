const fs = require("fs/promises");
const path = require("path");

const { getCookieToken, verifyToken } = require("./_lib/gate");
const { recordEvent } = require("./_lib/admin-data");

const deckPath = path.join(__dirname, "..", "..", "index_rivex_pitchbook.html");

exports.handler = async function handler(event) {
  try {
    const token = getCookieToken(event.headers || {});
    const session = verifyToken(token);

    if (!session) {
      return {
        statusCode: 302,
        headers: {
          Location: "/",
          "Cache-Control": "no-store",
        },
        body: "",
      };
    }

    await recordEvent(event, {
      type: "deck_view",
      email: session.email,
      ip: event.headers["x-nf-client-connection-ip"] || event.headers["x-forwarded-for"] || null,
      userAgent: event.headers["user-agent"] || null,
      path: "/deck",
    });

    const html = await fs.readFile(deckPath, "utf8");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
      body: html,
    };
  } catch (error) {
    console.error("RIVEX deck delivery failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "Protected deck is temporarily unavailable.",
    };
  }
};
