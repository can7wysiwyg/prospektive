const lecTaskCon = document.getElementById('lecTaskCon');
const schoolkey  = localStorage.getItem('schoolKey');

function spinner() {
  return `<div class="main-spinner text-center" style="padding:60px 0;">
    <div class="spinner-border" role="status"></div>
    <p class="mt-2" style="color:var(--muted);font-size:13px;">Loading…</p>
  </div>`;
}

async function LecturerDash() {
  try {
    lecTaskCon.innerHTML = spinner();
    if (!schoolkey) { window.location.href = '/'; return; }

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` };

    // Parallel: user info + programme students + all enrolled (for total count)
    const [userRes, progRes] = await Promise.all([
      fetch('/auth/user-details',       { headers }),
      fetch('/lecture/course-students', { headers }),
    ]);

    const [userData, progData] = await Promise.all([userRes.json(), progRes.json()]);

    if (userData.msg) { localStorage.removeItem('schoolKey'); window.location.href = '/'; return; }
    if (userData?.user?.role !== 'lecturer') { window.location.href = '/'; return; }

    const user      = userData.user;
    const initials  = (user.fullname || 'L').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const progName  = progData?.prog_details?.name  || 'Not Assigned';
    const progId    = progData?.prog_details?.id    || '—';
    const enrolled  = progData?.enrolled            || [];
    const stuCount  = enrolled.length;

    // Fetch grades sent by this lecturer to get module count
    // We'll estimate from enrolled — grades aren't directly queryable from lecturer side,
    // so we show students as the main metric and use enrolled for the roster.

    lecTaskCon.innerHTML = `
      <!-- Welcome banner -->
      <div class="welcome-banner" style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;">
        <div style="width:60px;height:60px;border-radius:50%;background:var(--gold);color:var(--navy);
                    display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;
                    flex-shrink:0;">${initials}</div>
        <div style="flex:1;">
          <h2 style="margin:0;">Hello, <span class="name-highlight">${user.fullname.split(' ')[0]}</span> 👋</h2>
          <p style="margin:4px 0 0;opacity:.7;font-size:13.5px;">
            Lecturer &nbsp;·&nbsp; ${user.email}
          </p>
        </div>
      </div>

      <!-- Stat row -->
      <div class="stats-row" style="margin-top:24px;">

        <div class="stat-card">
          <div class="stat-card-top">
            <div class="stat-card-icon gold"><i class="ti ti-users"></i></div>
          </div>
          <div class="stat-card-num">${stuCount}</div>
          <div class="stat-card-label">Students in Programme</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <div class="stat-card-icon navy"><i class="ti ti-certificate"></i></div>
          </div>
          <div class="stat-card-num" style="font-size:14px;line-height:1.3;">${progName}</div>
          <div class="stat-card-label">Assigned Programme</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <div class="stat-card-icon navy"><i class="ti ti-id-badge-2"></i></div>
          </div>
          <div class="stat-card-num" style="font-size:18px;font-family:var(--mono);">${progId}</div>
          <div class="stat-card-label">Programme ID</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <div class="stat-card-icon green"><i class="ti ti-activity"></i></div>
          </div>
          <div class="stat-card-num" style="font-size:16px;color:#16a34a;">Active</div>
          <div class="stat-card-label">Account Status</div>
        </div>

      </div>

      <!-- Nav cards -->
      <div class="page-header" style="margin-top:8px;">
        <h1>Lecturer Tools</h1>
        <p>Everything you need to manage your programme and students.</p>
      </div>

      <div class="card-grid" style="margin-bottom:28px;">

        <div class="portal-card">
          <div class="portal-card-icon"><i class="ti ti-report-analytics"></i></div>
          <h4>Grade Management</h4>
          <p>Upload grades individually per student or import a full class via Excel spreadsheet.</p>
          <a href="/sendgrades" class="portal-btn"><i class="ti ti-arrow-right"></i> Manage Grades</a>
        </div>

        <div class="portal-card">
          <div class="portal-card-icon"><i class="ti ti-users"></i></div>
          <h4>My Students</h4>
          <p>View all students enrolled in your programme — search by name or check contact details.</p>
          <a href="/sendgrades#students" class="portal-btn"><i class="ti ti-arrow-right"></i> View Students</a>
        </div>

        <div class="portal-card">
          <div class="portal-card-icon"><i class="ti ti-file-spreadsheet"></i></div>
          <h4>Bulk Grade Import</h4>
          <p>Download the grade template, fill it in, and import the whole class at once.</p>
          <a href="/sendgrades#import" class="portal-btn"><i class="ti ti-arrow-right"></i> Import Grades</a>
        </div>

      </div>

      <!-- Student preview roster -->
      ${stuCount > 0 ? `
      <div class="content-box">
        <div class="content-box-header">
          <div class="content-box-title"><i class="ti ti-users me-2"></i>Programme Roster — ${progName}</div>
          <a href="/sendgrades" style="font-size:12.5px;color:var(--gold);font-weight:600;text-decoration:none;">
            View all <i class="ti ti-arrow-right" style="font-size:12px;"></i>
          </a>
        </div>
        <div class="content-box-body" style="padding:0;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:var(--cream);border-bottom:1px solid var(--border);">
                <th style="padding:11px 20px;font-size:11.5px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;text-align:left;">#</th>
                <th style="padding:11px 20px;font-size:11.5px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;text-align:left;">Student</th>
                <th style="padding:11px 20px;font-size:11.5px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;text-align:left;">Email</th>
                <th style="padding:11px 20px;font-size:11.5px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;text-align:left;">Phone</th>
              </tr>
            </thead>
            <tbody>
              ${enrolled.slice(0, 8).map((s, i) => {
                const ini = (s.fullname || 'S').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
                return `<tr style="border-bottom:1px solid var(--border);">
                  <td style="padding:12px 20px;font-size:12.5px;color:var(--muted);font-family:var(--mono);">${String(i+1).padStart(2,'0')}</td>
                  <td style="padding:12px 20px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div style="width:32px;height:32px;border-radius:50%;background:var(--navy);color:var(--gold);
                                  display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">${ini}</div>
                      <div style="font-size:13.5px;font-weight:600;color:var(--navy);">${s.fullname}</div>
                    </div>
                  </td>
                  <td style="padding:12px 20px;font-size:13px;color:var(--muted);">${s.email}</td>
                  <td style="padding:12px 20px;font-size:13px;color:var(--muted);font-family:var(--mono);">${s.phone || '—'}</td>
                </tr>`;
              }).join('')}
              ${enrolled.length > 8 ? `
              <tr>
                <td colspan="4" style="padding:13px 20px;text-align:center;font-size:13px;color:var(--muted);">
                  + ${enrolled.length - 8} more students —
                  <a href="/sendgrades" style="color:var(--gold);font-weight:600;text-decoration:none;">view all</a>
                </td>
              </tr>` : ''}
            </tbody>
          </table>
        </div>
      </div>
      ` : `
      <div class="content-box" style="text-align:center;padding:48px;">
        <i class="ti ti-user-off" style="font-size:40px;color:var(--muted);"></i>
        <p style="color:var(--muted);margin-top:14px;font-size:14px;">
          ${progData?.msg || 'No students enrolled in your programme yet.'}
        </p>
      </div>`}`;

  } catch (err) {
    lecTaskCon.innerHTML = `<p class="text-center text-danger">Failed to load dashboard. Please refresh.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', LecturerDash);
