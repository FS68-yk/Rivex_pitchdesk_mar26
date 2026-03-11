const { buildClearAdminCookie } = require("./_lib/admin-auth");

exports.handler = async function handler() {
  return {
    statusCode: 302,
    headers: {
      Location: "/admin",
      "Cache-Control": "no-store",
      "Set-Cookie": buildClearAdminCookie(),
    },
    body: "",
  };
};
