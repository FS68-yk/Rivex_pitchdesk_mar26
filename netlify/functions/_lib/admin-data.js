const crypto = require("crypto");

const { getAdminStore } = require("./blobs-store");

const ANALYTICS_KEY = "analytics";
const CODES_KEY = "codes";

function nowIso() {
  return new Date().toISOString();
}

function createCodeId() {
  return crypto.randomBytes(8).toString("hex");
}

function generateAccessCode() {
  return `RIVEX-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

async function getAnalytics(event) {
  const store = getAdminStore(event);
  const analytics = await store.get(ANALYTICS_KEY, { type: "json" });
  return analytics || {
    totals: {
      successfulLogins: 0,
      deckViews: 0,
      uniqueEmails: 0,
    },
    emailStats: {},
    recentEvents: [],
    updatedAt: null,
  };
}

async function saveAnalytics(event, analytics) {
  const store = getAdminStore(event);
  analytics.updatedAt = nowIso();
  await store.setJSON(ANALYTICS_KEY, analytics);
}

async function getCodes(event) {
  const store = getAdminStore(event);
  let codes = await store.get(CODES_KEY, { type: "json" });

  if (!Array.isArray(codes) || codes.length === 0) {
    const fallbackCode = (process.env.RIVEX_INVITE_CODE || "").trim();
    codes = fallbackCode ? [{
      id: createCodeId(),
      label: "Default",
      code: fallbackCode,
      active: true,
      createdAt: nowIso(),
      lastUsedAt: null,
      useCount: 0,
    }] : [];
    if (codes.length > 0) {
      await store.setJSON(CODES_KEY, codes);
    }
  }

  return codes;
}

async function saveCodes(event, codes) {
  const store = getAdminStore(event);
  await store.setJSON(CODES_KEY, codes);
}

async function findActiveCode(event, code) {
  const normalized = String(code || "").trim();
  if (!normalized) return null;
  const codes = await getCodes(event);
  return codes.find((entry) => entry.active && entry.code === normalized) || null;
}

async function touchCodeUse(event, code) {
  const codes = await getCodes(event);
  let changed = false;

  const updated = codes.map((entry) => {
    if (entry.code !== code) {
      return entry;
    }
    changed = true;
    return {
      ...entry,
      lastUsedAt: nowIso(),
      useCount: Number(entry.useCount || 0) + 1,
    };
  });

  if (changed) {
    await saveCodes(event, updated);
  }
}

async function addCode(event, payload) {
  const codes = await getCodes(event);
  const code = String(payload.code || generateAccessCode()).trim().toUpperCase();

  if (!code) {
    throw new Error("Code is required.");
  }
  if (codes.some((entry) => entry.code === code)) {
    throw new Error("Code already exists.");
  }

  const next = [{
    id: createCodeId(),
    label: String(payload.label || "New code").trim() || "New code",
    code,
    active: true,
    createdAt: nowIso(),
    lastUsedAt: null,
    useCount: 0,
  }, ...codes];

  await saveCodes(event, next);
  return next;
}

async function toggleCode(event, codeId, active) {
  const codes = await getCodes(event);
  const next = codes.map((entry) => entry.id === codeId ? { ...entry, active } : entry);
  await saveCodes(event, next);
  return next;
}

async function deleteCode(event, codeId) {
  const codes = await getCodes(event);
  const next = codes.filter((entry) => entry.id !== codeId);
  await saveCodes(event, next);
  return next;
}

async function recordEvent(event, payload) {
  const analytics = await getAnalytics(event);
  const email = String(payload.email || "").trim().toLowerCase();
  const timestamp = payload.occurredAt || nowIso();

  if (payload.type === "login_success") {
    analytics.totals.successfulLogins += 1;
  }
  if (payload.type === "deck_view") {
    analytics.totals.deckViews += 1;
  }

  if (email) {
    const existing = analytics.emailStats[email] || {
      email,
      loginCount: 0,
      deckViewCount: 0,
      lastSeenAt: null,
      lastCode: null,
      lastIP: null,
      lastUserAgent: null,
    };

    if (payload.type === "login_success") {
      existing.loginCount += 1;
    }
    if (payload.type === "deck_view") {
      existing.deckViewCount += 1;
    }

    existing.lastSeenAt = timestamp;
    existing.lastCode = payload.code || existing.lastCode;
    existing.lastIP = payload.ip || existing.lastIP;
    existing.lastUserAgent = payload.userAgent || existing.lastUserAgent;
    analytics.emailStats[email] = existing;
    analytics.totals.uniqueEmails = Object.keys(analytics.emailStats).length;
  }

  analytics.recentEvents.unshift({
    id: `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    type: payload.type,
    email,
    code: payload.code || null,
    ip: payload.ip || null,
    userAgent: payload.userAgent || null,
    path: payload.path || null,
    occurredAt: timestamp,
  });

  analytics.recentEvents = analytics.recentEvents.slice(0, 100);
  await saveAnalytics(event, analytics);
}

function summarizeAnalytics(analytics) {
  const emails = Object.values(analytics.emailStats || {}).sort((a, b) => {
    return new Date(b.lastSeenAt || 0).getTime() - new Date(a.lastSeenAt || 0).getTime();
  });

  return {
    totals: analytics.totals,
    updatedAt: analytics.updatedAt,
    recentEvents: analytics.recentEvents || [],
    emails,
  };
}

module.exports = {
  addCode,
  deleteCode,
  findActiveCode,
  generateAccessCode,
  getAnalytics,
  getCodes,
  recordEvent,
  summarizeAnalytics,
  toggleCode,
  touchCodeUse,
};
