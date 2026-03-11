const { buildClearCookie } = require("./_lib/gate");

exports.handler = async function handler() {
  return {
    statusCode: 302,
    headers: {
      Location: "/",
      "Cache-Control": "no-store",
      "Set-Cookie": buildClearCookie(),
    },
    body: "",
  };
};
