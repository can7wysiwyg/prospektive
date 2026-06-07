const stuPanelCon = document.getElementById('stuPanelCon');
const schoolkey   = localStorage.getItem('schoolKey');

// ── Grade letter → GPA point ──────────────────────────────────
function gradePoint(g = '') {
  const map = { A:4.0, B:3.0, C:2.0, D:1.0, F:0.0 };
  return map[g.trim().toUpperCase().charAt(0)] ?? null;
}

// ── Derive letter from points average ────────────────────────
function pointsToLetter(p) {
  if (p >= 3.7) return 'A';
  if (p >= 3.0) return 'B';
  if (p >= 2.0) return 'C';
  if (p >= 1.0) return 'D';
  return 'F';
}

function gradeColor(letter) {
  return { A:'#16a34a', B:'#2563eb', C:'#d97706', D:'#ea580c', F:'#dc2626' }[letter] || '#6b7280';
}

// ── Parse grade field: either "A" or "CA:70 Exam:80" style ───
function parseGrade(raw = '') {
  const simple = raw.trim().toUpperCase();
  if (simple.length <= 2) return simple.charAt(0);           // plain letter
  // Try to extract final/overall grade from a breakdown string
  const match = raw.match(/(?:overall|final|grade)[:\s]+([A-Fa-f])/i);
  if (match) return match[1].toUpperCase();
  // Fallback: take the last capital letter token
  const letters = raw.match(/\b([A-Fa-f])\b/g);
  return letters ? letters[letters.length - 1].toUpperCase() : '—';
}

// ── Spinner ───────────────────────────────────────────────────
function spinner() {
  return `<div class="main-spinner text-center" style="padding:60px 0;">
    <div class="spinner-border" role="status"></div>
    <p class="mt-2" style="color:var(--muted);font-size:13px;">Loading…</p>
  </div>`;
}

async function StudentPanel() {
  try {
    stuPanelCon.innerHTML = spinner();
    if (!schoolkey) { window.location.href = '/'; return; }

    // Parallel fetch: user + grades + fees
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` };

    const [userRes, gradesRes, feesRes] = await Promise.all([
      fetch('/auth/user-details',  { headers }),
      fetch('/student/get-my-grades', { headers }),
      fetch('/student/check-fees',    { headers })
    ]);

    const [userData, gradesData, feesData] = await Promise.all([
      userRes.json(), gradesRes.json(), feesRes.json()
    ]);

    if (userData.msg) { localStorage.removeItem('schoolKey'); window.location.href = '/'; return; }
    if (userData?.user?.role !== 'student') { window.location.href = '/'; return; }

    const user   = userData.user;
    const grades = gradesData.grades || [];
    const fees   = feesData.mystat;

    // ── Compute overall GPA ───────────────────────────────────
    let gpa = null; let overallLetter = '—'; let gradeColorVal = '#6b7280';
    if (grades.length) {
      const points = grades
        .map(g => gradePoint(parseGrade(g.grade)))
        .filter(p => p !== null);
      if (points.length) {
        gpa = (points.reduce((a, b) => a + b, 0) / points.length).toFixed(2);
        overallLetter = pointsToLetter(parseFloat(gpa));
        gradeColorVal = gradeColor(overallLetter);
      }
    }

    // ── Fees badge ────────────────────────────────────────────
    const feeStatus = !fees ? 'Not Paid' : fees.status === 'paid' ? 'Cleared' : 'Pending';
    const feeColor  = !fees ? '#dc2626' : fees.status === 'paid' ? '#16a34a' : '#d97706';

    // ── Initials ──────────────────────────────────────────────
    const initials = (user.fullname || 'S').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    stuPanelCon.innerHTML = `
      <!-- Welcome banner -->
      <div class="welcome-banner" style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;">
        <div style="width:60px;height:60px;border-radius:50%;background:var(--gold);color:var(--navy);
                    display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;
                    flex-shrink:0;">${initials}</div>
        <div>
          <h2 style="margin:0;">Hello, <span class="name-highlight">${user.fullname.split(' ')[0]}</span> 👋</h2>
          <p style="margin:4px 0 0;opacity:.7;font-size:13.5px;">${user.program || 'Student'} &nbsp;·&nbsp; ${user.student_reg || 'N/A'}</p>
        </div>
      </div>

      <!-- Stat row -->
      <div class="stats-row" style="margin-top:24px;">

        <div class="stat-card">
          <div class="stat-card-top">
            <div class="stat-card-icon" style="background:rgba(224,168,32,0.12);color:var(--gold);">
              <i class="ti ti-report-analytics"></i>
            </div>
          </div>
          <div class="stat-card-num" style="color:${gradeColorVal};">${overallLetter}</div>
          <div class="stat-card-label">Overall Grade${gpa ? ` &nbsp;<span style="font-family:var(--mono);font-size:11px;color:var(--muted);">(GPA ${gpa})</span>` : ''}</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <div class="stat-card-icon navy"><i class="ti ti-books"></i></div>
          </div>
          <div class="stat-card-num">${grades.length}</div>
          <div class="stat-card-label">Modules Graded</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <div class="stat-card-icon" style="background:rgba(22,163,74,0.1);color:${feeColor};">
              <i class="ti ti-cash"></i>
            </div>
          </div>
          <div class="stat-card-num" style="font-size:18px;color:${feeColor};">${feeStatus}</div>
          <div class="stat-card-label">Fees Status</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <div class="stat-card-icon navy"><i class="ti ti-certificate"></i></div>
          </div>
          <div class="stat-card-num" style="font-size:16px;">${user.program || '—'}</div>
          <div class="stat-card-label">Programme</div>
        </div>

      </div>

      <!-- Quick nav cards -->
      <div class="page-header" style="margin-top:8px;">
        <h1>My Portal</h1>
        <p>Navigate your academic resources.</p>
      </div>

      <div class="card-grid">

        <div class="portal-card">
          <div class="portal-card-icon"><i class="ti ti-clipboard-data"></i></div>
          <h4>My Grades</h4>
          <p>View your module results with a full grade breakdown and your computed GPA.</p>
          <a href="/viewgrades" class="portal-btn"><i class="ti ti-arrow-right"></i> View Grades</a>
        </div>

        <div class="portal-card">
          <div class="portal-card-icon"><i class="ti ti-cash"></i></div>
          <h4>Fees & Clearance</h4>
          <p>Check your fees balance, payment status, and download your clearance letter.</p>
          <a href="/myfees" class="portal-btn"><i class="ti ti-arrow-right"></i> View Fees</a>
        </div>

        <div class="portal-card">
          <div class="portal-card-icon"><i class="ti ti-books"></i></div>
          <h4>Course Registration</h4>
          <p>Browse available courses for this semester and register your modules.</p>
          <a href="/courses" class="portal-btn"><i class="ti ti-arrow-right"></i> Register Courses</a>
        </div>

        <div class="portal-card">
          <div class="portal-card-icon"><i class="ti ti-user"></i></div>
          <h4>My Profile</h4>
          <p>View your personal details, registration number, and contact information.</p>
          <a href="/myprofile" class="portal-btn"><i class="ti ti-arrow-right"></i> View Profile</a>
        </div>

      </div>`;

  } catch (err) {
    stuPanelCon.innerHTML = `<p class="text-center text-danger">Failed to load dashboard. Please refresh.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', StudentPanel);
