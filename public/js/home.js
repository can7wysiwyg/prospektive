const homeContent = document.getElementById('homeContent');
const schoolkey = localStorage.getItem('schoolKey');

// ── Shared notice block (always shown) ────────────────────────
const NOTICES_HTML = `
<div class="content-box">
  <div class="content-box-header">
    <div class="content-box-title"><i class="ti ti-speakerphone me-2"></i>School Notices</div>
  </div>
  <div class="content-box-body">
    <div class="notice-list">
      <div class="notice-item">
        <div class="notice-date"><div class="notice-day">02</div><div class="notice-mon">Jun</div></div>
        <div>
          <div class="notice-title">Term 2 Examination Timetable Released</div>
          <div class="notice-body">The final examination timetable for Term 2 is now available. Students are advised to check their schedules and report any clashes immediately.</div>
        </div>
        <span class="notice-tag tag-exam">Exam</span>
      </div>
      <div class="notice-item">
        <div class="notice-date"><div class="notice-day">30</div><div class="notice-mon">May</div></div>
        <div>
          <div class="notice-title">Inter-House Sports Day — Friday</div>
          <div class="notice-body">Annual sports day on the school grounds. All students are expected to participate in house colours.</div>
        </div>
        <span class="notice-tag tag-event">Event</span>
      </div>
      <div class="notice-item">
        <div class="notice-date"><div class="notice-day">28</div><div class="notice-mon">May</div></div>
        <div>
          <div class="notice-title">Term 2 Fee Deadline Reminder</div>
          <div class="notice-body">Outstanding fees must be cleared by 6 June 2026 to avoid suspension from examinations.</div>
        </div>
        <span class="notice-tag tag-admin">Admin</span>
      </div>
    </div>
  </div>
</div>`;

// ── Stat card builder ─────────────────────────────────────────
function statCard({ icon, iconClass, value, label, href }) {
  const num = href
    ? `<a href="${href}" style="text-decoration:none;"><div class="stat-card-num" style="color:var(--gold);">${value}</div></a>`
    : `<div class="stat-card-num">${value}</div>`;
  return `
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-card-icon ${iconClass}"><i class="ti ${icon}"></i></div>
      </div>
      ${num}
      <div class="stat-card-label">${label}</div>
    </div>`;
}

// ── Quick-access mini card ────────────────────────────────────
function quickCard({ href, icon, label, sub, dark }) {
  const bg = dark ? 'background:var(--navy);border-color:var(--navy);' : '';
  const labelColor = dark ? 'color:#fff;' : 'color:var(--navy);';
  const subColor = dark ? 'color:rgba(255,255,255,0.5);' : 'color:var(--muted);';
  const iconBg = dark ? 'background:rgba(224,168,32,0.15);' : '';
  return `
    <a href="${href}" class="portal-card" style="padding:16px;text-decoration:none;${bg}">
      <div class="portal-card-icon" style="width:40px;height:40px;font-size:18px;margin-bottom:10px;border-radius:10px;${iconBg}">
        <i class="ti ${icon}" ${dark ? 'style="color:var(--gold);"' : ''}></i>
      </div>
      <div style="font-size:13px;font-weight:600;${labelColor}">${label}</div>
      <div style="font-size:11px;margin-top:2px;${subColor}">${sub}</div>
    </a>`;
}

// ── GUEST (not signed in) ─────────────────────────────────────
function renderGuest() {
  homeContent.innerHTML = `
    <div class="welcome-banner">
      <h2>Welcome to <span class="name-highlight">Don Bosco</span> Student Portal</h2>
      <p>Your academic hub — access results, fees, courses, and institutional notices. Sign in to get started.</p>
    </div>

    <div class="row g-4">
      <div class="col-lg-7">${NOTICES_HTML}</div>
      <div class="col-lg-5">
        <div class="content-box">
          <div class="content-box-header">
            <div class="content-box-title"><i class="ti ti-apps me-2"></i>Quick Access</div>
          </div>
          <div class="content-box-body">
            <div class="card-grid" style="grid-template-columns:1fr 1fr;gap:10px;">
              ${quickCard({ href:'/account', icon:'ti-login', label:'Sign In', sub:'Portal', dark:true })}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── STUDENT ───────────────────────────────────────────────────
function renderStudent(user) {
  homeContent.innerHTML = `
    <div class="welcome-banner">
      <h2>Welcome back, <span class="name-highlight">${user.fullname}</span></h2>
      <p>Your academic hub — check your results, fees, and profile from the quick links below.</p>
    </div>

    <div class="stats-row">
      ${statCard({ icon:'ti-books',          iconClass:'navy',  value:'5',  label:'Active Courses' })}
      ${statCard({ icon:'ti-chart-line',      iconClass:'green', value:'94%', label:'Pass Rate 2025' })}
    </div>

    <div class="row g-4">
      <div class="col-lg-7">${NOTICES_HTML}</div>
      <div class="col-lg-5">
        <div class="content-box">
          <div class="content-box-header">
            <div class="content-box-title"><i class="ti ti-apps me-2"></i>Quick Access</div>
          </div>
          <div class="content-box-body">
            <div class="card-grid" style="grid-template-columns:1fr 1fr;gap:10px;">
              ${quickCard({ href:'/viewgrades', icon:'ti-clipboard-data', label:'My Grades', sub:'Results'  })}
              ${quickCard({ href:'/myfees',     icon:'ti-cash',           label:'Fees',       sub:'Payments' })}
              ${quickCard({ href:'/myprofile',  icon:'ti-user',           label:'Profile',    sub:'Info'     })}
              ${quickCard({ href:'/studentpanel', icon:'ti-layout-dashboard', label:'Dashboard', sub:'Overview' })}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── LECTURER ──────────────────────────────────────────────────
function renderLecturer(user) {
  homeContent.innerHTML = `
    <div class="welcome-banner">
      <h2>Welcome, <span class="name-highlight">${user.fullname}</span></h2>
      <p>Manage your program, upload grades, and view enrolled students from here.</p>
    </div>

    <div class="row g-4">
      <div class="col-lg-7">${NOTICES_HTML}</div>
      <div class="col-lg-5">
        <div class="content-box">
          <div class="content-box-header">
            <div class="content-box-title"><i class="ti ti-apps me-2"></i>Quick Access</div>
          </div>
          <div class="content-box-body">
            <div class="card-grid" style="grid-template-columns:1fr 1fr;gap:10px;">
              ${quickCard({ href:'/lecturertasks', icon:'ti-layout-dashboard',  label:'Dashboard',     sub:'Overview'       })}
              ${quickCard({ href:'/sendgrades',    icon:'ti-report-analytics',  label:'Manage Grades', sub:'Upload results' })}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── ADMIN (dynamic counts) ────────────────────────────────────
async function renderAdmin(user) {
  // Render skeleton first
  homeContent.innerHTML = `
    <div class="welcome-banner">
      <h2>Admin Panel — <span class="name-highlight">Don Bosco</span></h2>
      <p>System overview. Click the stat numbers to navigate to the full list.</p>
    </div>
    <div class="stats-row" id="adminStats">
      ${statCard({ icon:'ti-users',      iconClass:'gold',  value:'…', label:'Enrolled Students' })}
      ${statCard({ icon:'ti-books',      iconClass:'navy',  value:'48', label:'Active Courses' })}
      ${statCard({ icon:'ti-chart-line', iconClass:'green', value:'94%', label:'Pass Rate 2024' })}
      ${statCard({ icon:'ti-chalkboard', iconClass:'navy',  value:'…', label:'Teaching Staff' })}
    </div>
    <div class="row g-4">
      <div class="col-lg-7">${NOTICES_HTML}</div>
      <div class="col-lg-5">
        <div class="content-box">
          <div class="content-box-header">
            <div class="content-box-title"><i class="ti ti-apps me-2"></i>Quick Access</div>
          </div>
          <div class="content-box-body">
            <div class="card-grid" style="grid-template-columns:1fr 1fr;gap:10px;">
              ${quickCard({ href:'/admindash',        icon:'ti-layout-dashboard', label:'Dashboard',  sub:'Overview'  })}
              ${quickCard({ href:'/addmethod',         icon:'ti-users-plus',       label:'Add Students', sub:'Import / manual' })}
              ${quickCard({ href:'/systemlecturers',   icon:'ti-chalkboard',       label:'Lecturers',  sub:'Manage'    })}
              ${quickCard({ href:'/systemstudents',    icon:'ti-id',               label:'Students',   sub:'All records' })}
              ${quickCard({ href:'/progsstudents',     icon:'ti-certificate',      label:'Programs',   sub:'Enrollment' })}
            </div>
          </div>
        </div>
      </div>
    </div>`;

  // Fetch real counts in parallel
  try {
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` };

    const [stuRes, lecRes, progStu] = await Promise.all([
      fetch('/admin/view-students', { headers }),
      fetch('/admin/view-lecturers', { headers }),
      fetch('/show-programs')
    ]);

    const [stuData, lecData, progData] = await Promise.all([stuRes.json(), lecRes.json(), progStu.json()]);

    const stuCount = Array.isArray(stuData?.students) ? stuData.students.length : '-';
    const lecCount = Array.isArray(lecData?.lecturers) ? lecData.lecturers.length : '-';
    const programs = Array.isArray(progData?.programs) ? progData.programs.length : '-'

    document.getElementById('adminStats').innerHTML = `
      ${statCard({ icon:'ti-users',      iconClass:'gold',  value:stuCount, label:'Enrolled Students', href:'/systemstudents' })}
      ${statCard({ icon:'ti-books',      iconClass:'navy',  value:programs,     label:'Active Courses', href: '/progsstudents' })}
      ${statCard({ icon:'ti-chart-line', iconClass:'green', value:'94%',    label:'Pass Rate 2025' })}
      ${statCard({ icon:'ti-chalkboard', iconClass:'navy',  value:lecCount, label:'Teaching Staff', href:'/systemlecturers' })}`;
  } catch (err) {
    // Counts just stay as '…' — non-fatal
    console.log('Could not fetch admin counts', err);
  }
}

// ── Entry point ───────────────────────────────────────────────
async function HomeInit() {
  if (!schoolkey) { renderGuest(); return; }

  try {
    const res = await fetch('/auth/user-details', {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` }
    });
    const data = await res.json();

    if (data.msg || !data.user) { localStorage.removeItem('schoolKey'); renderGuest(); return; }

    const role = data.user.role;
    if      (role === 'student')  renderStudent(data.user);
    else if (role === 'lecturer') renderLecturer(data.user);
    else if (role === 'admin')    renderAdmin(data.user);
    else                          renderGuest();

  } catch (err) {
    renderGuest();
  }
}

document.addEventListener('DOMContentLoaded', HomeInit);
