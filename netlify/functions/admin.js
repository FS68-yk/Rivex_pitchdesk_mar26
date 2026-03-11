const { getAdminEmail, getAdminToken, verifyAdminToken } = require("./_lib/admin-auth");

function renderPage(session) {
  const expectedEmail = getAdminEmail();
  const loginHint = expectedEmail ? `Admin email: ${expectedEmail}` : "Admin email enabled";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex,nofollow" />
  <title>RIVEX Admin</title>
  <style>
    :root {
      --bg: #061015;
      --panel: rgba(10, 16, 21, 0.82);
      --border: rgba(255,255,255,0.08);
      --ink: #f4fbfc;
      --muted: rgba(244,251,252,0.62);
      --accent: #00b8cc;
      --danger: #ff6f7d;
      --success: #5fe0b7;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      --font-mono: "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(0,184,204,0.16), transparent 26%),
        linear-gradient(180deg, #040608 0%, #091116 100%);
      color: var(--ink);
      font-family: var(--font-sans);
      padding: 24px;
    }
    .shell {
      width: min(1180px, 100%);
      margin: 0 auto;
      display: grid;
      gap: 20px;
    }
    .topbar, .panel, .login-card {
      border: 1px solid var(--border);
      background: var(--panel);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 24px 80px rgba(0,0,0,0.28);
    }
    .topbar {
      padding: 18px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .brand {
      display: grid;
      gap: 6px;
    }
    .brand .mark {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 6px;
      color: var(--accent);
      font-weight: 800;
    }
    .brand .title {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -1px;
    }
    .brand .sub {
      color: var(--muted);
      font-size: 14px;
    }
    .logout {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 11px 16px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.12);
      color: var(--ink);
      text-decoration: none;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.6px;
      text-transform: uppercase;
    }
    .grid {
      display: grid;
      gap: 20px;
      grid-template-columns: 1.3fr 0.9fr;
    }
    .panel {
      padding: 20px;
      display: grid;
      gap: 18px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--accent);
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .card {
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
      padding: 16px;
      display: grid;
      gap: 8px;
    }
    .card .label {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .card .value {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -1px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th, td {
      padding: 12px 10px;
      border-top: 1px solid rgba(255,255,255,0.06);
      vertical-align: top;
      text-align: left;
    }
    th {
      color: rgba(255,255,255,0.42);
      font-size: 11px;
      letter-spacing: 1.4px;
      text-transform: uppercase;
    }
    .muted { color: var(--muted); }
    .mono { font-family: var(--font-mono); }
    .code-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 10px;
      align-items: center;
      padding: 12px 0;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 10px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      font-weight: 800;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .badge.active { color: var(--success); }
    .badge.inactive { color: rgba(255,255,255,0.54); }
    .inline-form, .login-form {
      display: grid;
      gap: 12px;
    }
    .inline-form { grid-template-columns: 1fr 1fr auto; }
    input, button {
      width: 100%;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03);
      color: var(--ink);
      padding: 13px 14px;
      font-size: 14px;
      outline: none;
    }
    button {
      cursor: pointer;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      background: linear-gradient(135deg, #14cadf, #009daf);
      color: #041012;
      border: none;
    }
    button.secondary {
      background: transparent;
      color: var(--ink);
      border: 1px solid rgba(255,255,255,0.12);
    }
    .actions {
      display: flex;
      gap: 8px;
    }
    .status {
      min-height: 20px;
      color: var(--muted);
      font-size: 13px;
    }
    .status.error { color: var(--danger); }
    .status.success { color: var(--success); }
    .login-shell {
      min-height: calc(100vh - 48px);
      display: grid;
      place-items: center;
    }
    .login-card {
      width: min(420px, 100%);
      padding: 28px;
      display: grid;
      gap: 16px;
    }
    .login-card h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1px;
    }
    .hint {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }
    @media (max-width: 980px) {
      body { padding: 16px; }
      .grid { grid-template-columns: 1fr; }
      .cards { grid-template-columns: 1fr; }
      .inline-form { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  ${session ? `
    <main class="shell">
      <div class="topbar">
        <div class="brand">
          <div class="mark">RIVEX</div>
          <div class="title">Admin Access</div>
          <div class="sub">Monitor gated traffic, investor logins, and access codes.</div>
        </div>
        <a class="logout" href="/admin-logout">Log Out</a>
      </div>

      <div class="grid">
        <section class="panel">
          <div class="section-title">Overview</div>
          <div class="cards" id="stat-cards"></div>
          <div class="section-title">Recent Activity</div>
          <div class="status" id="activity-status">Loading activity...</div>
          <div style="overflow:auto;">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>Code</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody id="activity-body"></tbody>
            </table>
          </div>
          <div class="section-title">Known Emails</div>
          <div style="overflow:auto;">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Logins</th>
                  <th>Deck Views</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody id="email-body"></tbody>
            </table>
          </div>
        </section>

        <aside class="panel">
          <div class="section-title">Access Codes</div>
          <form class="inline-form" id="code-form">
            <input id="code-label" type="text" placeholder="Label" />
            <input id="code-value" type="text" placeholder="Code (leave blank to generate)" />
            <button type="submit">Add</button>
          </form>
          <div class="status" id="code-status"></div>
          <div id="codes-list"></div>
        </aside>
      </div>
    </main>
  ` : `
    <div class="login-shell">
      <div class="login-card">
        <div class="section-title">RIVEX Admin</div>
        <h1>Sign in to the admin console.</h1>
        <div class="hint">${loginHint}</div>
        <form class="login-form" id="admin-login-form">
          <input id="admin-email" type="email" placeholder="admin@company.com" />
          <input id="admin-code" type="password" placeholder="Admin code" />
          <button type="submit">Unlock Admin</button>
        </form>
        <div class="status" id="login-status"></div>
      </div>
    </div>
  `}
  <script>
    (function() {
      const session = ${JSON.stringify(Boolean(session))};
      if (!session) {
        const form = document.getElementById('admin-login-form');
        const status = document.getElementById('login-status');
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          status.textContent = '';
          const email = document.getElementById('admin-email').value.trim();
          const code = document.getElementById('admin-code').value.trim();
          const res = await fetch('/.netlify/functions/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.ok) {
            status.className = 'status error';
            status.textContent = data.error || 'Unable to sign in.';
            return;
          }
          window.location.href = '/admin';
        });
        return;
      }

      const activityBody = document.getElementById('activity-body');
      const emailBody = document.getElementById('email-body');
      const cards = document.getElementById('stat-cards');
      const codesList = document.getElementById('codes-list');
      const activityStatus = document.getElementById('activity-status');
      const codeStatus = document.getElementById('code-status');
      const codeForm = document.getElementById('code-form');

      function formatDate(value) {
        if (!value) return '—';
        try {
          return new Date(value).toLocaleString();
        } catch {
          return value;
        }
      }

      function setCodeStatus(message, type) {
        codeStatus.className = 'status' + (type ? ' ' + type : '');
        codeStatus.textContent = message || '';
      }

      function renderCards(analytics) {
        const list = [
          ['Successful Logins', analytics.totals.successfulLogins || 0],
          ['Deck Views', analytics.totals.deckViews || 0],
          ['Unique Emails', analytics.totals.uniqueEmails || 0],
        ];
        cards.innerHTML = list.map(([label, value]) => \`
          <div class="card">
            <div class="label">\${label}</div>
            <div class="value">\${value}</div>
          </div>
        \`).join('');
      }

      function renderActivity(events) {
        activityBody.innerHTML = events.map((item) => \`
          <tr>
            <td class="muted">\${formatDate(item.occurredAt)}</td>
            <td>\${item.email || '—'}</td>
            <td class="mono">\${item.type || '—'}</td>
            <td class="mono">\${item.code || '—'}</td>
            <td class="muted">\${item.ip || '—'}</td>
          </tr>
        \`).join('') || '<tr><td colspan="5" class="muted">No activity yet.</td></tr>';
      }

      function renderEmails(emails) {
        emailBody.innerHTML = emails.map((item) => \`
          <tr>
            <td>\${item.email}</td>
            <td>\${item.loginCount || 0}</td>
            <td>\${item.deckViewCount || 0}</td>
            <td class="muted">\${formatDate(item.lastSeenAt)}</td>
          </tr>
        \`).join('') || '<tr><td colspan="4" class="muted">No email records yet.</td></tr>';
      }

      function renderCodes(codes) {
        codesList.innerHTML = codes.map((item) => \`
          <div class="code-row">
            <div>
              <div style="font-weight:700;">\${item.label || 'Access code'}</div>
              <div class="mono" style="margin-top:4px;">\${item.code}</div>
              <div class="muted" style="margin-top:6px;font-size:12px;">Uses: \${item.useCount || 0} · Last used: \${formatDate(item.lastUsedAt)}</div>
            </div>
            <span class="badge \${item.active ? 'active' : 'inactive'}">\${item.active ? 'Active' : 'Paused'}</span>
            <div class="actions">
              <button class="secondary" data-action="toggle" data-id="\${item.id}" data-active="\${!item.active}">\${item.active ? 'Pause' : 'Activate'}</button>
              <button class="secondary" data-action="delete" data-id="\${item.id}">Delete</button>
            </div>
          </div>
        \`).join('');
      }

      async function loadData() {
        activityStatus.textContent = 'Loading activity...';
        const res = await fetch('/.netlify/functions/admin-data');
        const data = await res.json();
        if (!res.ok || !data.ok) {
          activityStatus.className = 'status error';
          activityStatus.textContent = data.error || 'Unable to load admin data.';
          return;
        }
        activityStatus.className = 'status';
        activityStatus.textContent = data.analytics.updatedAt ? 'Updated ' + formatDate(data.analytics.updatedAt) : '';
        renderCards(data.analytics);
        renderActivity(data.analytics.recentEvents || []);
        renderEmails(data.analytics.emails || []);
        renderCodes(data.codes || []);
      }

      codeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setCodeStatus('', '');
        const label = document.getElementById('code-label').value.trim();
        const code = document.getElementById('code-value').value.trim();
        const res = await fetch('/.netlify/functions/admin-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add', label, code }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setCodeStatus(data.error || 'Unable to add code.', 'error');
          return;
        }
        codeForm.reset();
        setCodeStatus('Code saved.', 'success');
        renderCodes(data.codes || []);
      });

      codesList.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const codeId = button.dataset.id;
        const payload = { action, codeId };
        if (action === 'toggle') {
          payload.active = button.dataset.active === 'true';
        }
        const res = await fetch('/.netlify/functions/admin-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setCodeStatus(data.error || 'Unable to update code.', 'error');
          return;
        }
        setCodeStatus('Code updated.', 'success');
        renderCodes(data.codes || []);
      });

      loadData();
    })();
  </script>
</body>
</html>`;
}

exports.handler = async function handler(event) {
  const session = verifyAdminToken(getAdminToken(event.headers || {}));
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
    body: renderPage(session),
  };
};
