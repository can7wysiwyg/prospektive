const coursesCon = document.getElementById('coursesCon');
const schoolkey  = localStorage.getItem('schoolKey');

// ── Hardcoded course catalogue ────────────────────────────────
// Update course codes, names, credits, and programmes as needed
const CATALOGUE = [
  {
    programme: 'Bachelor of Science in Information Technology',
    prog_id: 'BSIT',
    courses: [
      { code:'BSIT101', name:'Introduction to Programming',       credits:3, semester:'Semester 1', lecturer:'TBA' },
      { code:'BSIT102', name:'Computer Architecture & Logic',     credits:3, semester:'Semester 1', lecturer:'TBA' },
      { code:'BSIT103', name:'Mathematics for Computing',         credits:3, semester:'Semester 1', lecturer:'TBA' },
      { code:'BSIT201', name:'Data Structures & Algorithms',      credits:3, semester:'Semester 2', lecturer:'TBA' },
      { code:'BSIT202', name:'Database Management Systems',       credits:3, semester:'Semester 2', lecturer:'TBA' },
      { code:'BSIT203', name:'Web Development Fundamentals',      credits:3, semester:'Semester 2', lecturer:'TBA' },
      { code:'BSIT301', name:'Software Engineering',              credits:3, semester:'Semester 3', lecturer:'TBA' },
      { code:'BSIT302', name:'Operating Systems',                 credits:3, semester:'Semester 3', lecturer:'TBA' },
      { code:'BSIT401', name:'Network & Security',                credits:3, semester:'Semester 4', lecturer:'TBA' },
      { code:'BSIT402', name:'Final Year Project I',              credits:6, semester:'Semester 4', lecturer:'TBA' },
    ]
  },
  {
    programme: 'Bachelor of Business Administration',
    prog_id: 'BBA',
    courses: [
      { code:'BBA101', name:'Principles of Management',           credits:3, semester:'Semester 1', lecturer:'TBA' },
      { code:'BBA102', name:'Business Communication',             credits:3, semester:'Semester 1', lecturer:'TBA' },
      { code:'BBA103', name:'Introduction to Economics',          credits:3, semester:'Semester 1', lecturer:'TBA' },
      { code:'BBA201', name:'Financial Accounting',               credits:3, semester:'Semester 2', lecturer:'TBA' },
      { code:'BBA202', name:'Marketing Principles',               credits:3, semester:'Semester 2', lecturer:'TBA' },
      { code:'BBA301', name:'Human Resource Management',          credits:3, semester:'Semester 3', lecturer:'TBA' },
      { code:'BBA302', name:'Business Law & Ethics',              credits:3, semester:'Semester 3', lecturer:'TBA' },
      { code:'BBA401', name:'Strategic Management',               credits:3, semester:'Semester 4', lecturer:'TBA' },
      { code:'BBA402', name:'Entrepreneurship & Innovation',      credits:3, semester:'Semester 4', lecturer:'TBA' },
    ]
  },
  {
    programme: 'Diploma in Education',
    prog_id: 'DPED',
    courses: [
      { code:'DPED101', name:'Foundations of Education',          credits:3, semester:'Semester 1', lecturer:'TBA' },
      { code:'DPED102', name:'Child Psychology',                  credits:3, semester:'Semester 1', lecturer:'TBA' },
      { code:'DPED201', name:'Curriculum Development',            credits:3, semester:'Semester 2', lecturer:'TBA' },
      { code:'DPED202', name:'Classroom Management',              credits:3, semester:'Semester 2', lecturer:'TBA' },
      { code:'DPED301', name:'Teaching Practice',                 credits:6, semester:'Semester 3', lecturer:'TBA' },
    ]
  },
];

const CURRENT_SEMESTER = 'Semester 1'; // ← change this each semester

// ── Storage key: registrations are stored in localStorage ────
const REG_KEY = `registered_courses_${schoolkey}`;

function getRegistered() {
  try { return JSON.parse(localStorage.getItem(REG_KEY) || '[]'); } catch { return []; }
}

function saveRegistered(list) {
  localStorage.setItem(REG_KEY, JSON.stringify(list));
}

function spinner() {
  return `<div class="main-spinner text-center" style="padding:60px 0;">
    <div class="spinner-border" role="status"></div>
    <p class="mt-2" style="color:var(--muted);font-size:13px;">Loading courses…</p>
  </div>`;
}

function renderCourses(user) {
  const registered = getRegistered();
  const studentProg = (user.program || '').trim();

  // Find the matching programme block (or show all if no match)
  const myProg = CATALOGUE.find(p =>
    p.programme.toLowerCase().includes(studentProg.toLowerCase()) ||
    studentProg.toLowerCase().includes(p.prog_id.toLowerCase())
  ) || null;

  const totalCredits = registered.reduce((sum, code) => {
    for (const p of CATALOGUE) {
      const c = p.courses.find(c => c.code === code);
      if (c) return sum + c.credits;
    }
    return sum;
  }, 0);

  coursesCon.innerHTML = `
    <div class="page-header">
      <h1>Course Registration</h1>
      <p>Register your modules for <strong>${CURRENT_SEMESTER}</strong>, Academic Year 2025/26.</p>
    </div>

    <!-- Stats row -->
    <div class="stats-row" style="margin-bottom:24px;">
      <div class="stat-card">
        <div class="stat-card-top">
          <div class="stat-card-icon gold"><i class="ti ti-books"></i></div>
        </div>
        <div class="stat-card-num" id="regCount">${registered.length}</div>
        <div class="stat-card-label">Registered Courses</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-top">
          <div class="stat-card-icon navy"><i class="ti ti-star"></i></div>
        </div>
        <div class="stat-card-num" id="creditCount">${totalCredits}</div>
        <div class="stat-card-label">Total Credits</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-top">
          <div class="stat-card-icon ${totalCredits >= 12 ? 'green' : 'red'}"><i class="ti ti-${totalCredits >= 12 ? 'circle-check-filled' : 'alert-circle'}"></i></div>
        </div>
        <div class="stat-card-num" style="font-size:16px;color:${totalCredits >= 12 ? '#16a34a' : '#dc2626'};">
          ${totalCredits >= 12 ? 'Min Met' : 'Too Few'}
        </div>
        <div class="stat-card-label">Minimum (12 credits)</div>
      </div>
    </div>

    <!-- Notice if courses already registered -->
    ${registered.length > 0 ? `
    <div style="background:#dbeafe;border:1px solid #93c5fd;border-radius:10px;padding:14px 18px;
                margin-bottom:20px;display:flex;align-items:center;gap:12px;">
      <i class="ti ti-info-circle" style="font-size:20px;color:#1d4ed8;flex-shrink:0;"></i>
      <div style="font-size:13.5px;color:#1e40af;">
        You have registered <strong>${registered.length}</strong> course(s).
        You can add or remove courses until the registration deadline.
      </div>
    </div>` : ''}

    <!-- Course blocks -->
    <div id="catalogueBlocks">
      ${(myProg ? [myProg] : CATALOGUE).map(prog => renderProgBlock(prog, registered)).join('')}
    </div>

    <!-- Footer action -->
    <div style="margin-top:28px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);
                padding:22px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;
                box-shadow:var(--shadow-sm);">
      <div>
        <div style="font-weight:700;font-size:15px;color:var(--navy);">Registration Summary</div>
        <div style="font-size:13px;color:var(--muted);margin-top:2px;">
          <span id="footerCount">${registered.length}</span> course(s) selected —
          <span id="footerCredits">${totalCredits}</span> credits
        </div>
      </div>
      <button id="confirmBtn" class="portal-btn" style="gap:8px;${registered.length === 0 ? 'opacity:.5;cursor:not-allowed;' : ''}">
        <i class="ti ti-check"></i>
        ${registered.length === 0 ? 'Select Courses First' : 'Confirm Registration'}
      </button>
    </div>`;

  // Attach toggle listeners
  document.querySelectorAll('.reg-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleCourse(btn.dataset.code, user));
  });

  // Confirm button
  document.getElementById('confirmBtn')?.addEventListener('click', () => {
    const current = getRegistered();
    if (current.length === 0) return;
    alert(`✅ Registration confirmed!\n\nYou have registered ${current.length} course(s) for ${CURRENT_SEMESTER}.\n\nPlease visit the Registrar's office or check your email for confirmation.`);
  });
}

function renderProgBlock(prog, registered) {
  // Group by semester
  const sems = [...new Set(prog.courses.map(c => c.semester))];

  return `
    <div class="content-box" style="margin-bottom:20px;">
      <div class="content-box-header">
        <div class="content-box-title" style="font-size:15px;">
          <i class="ti ti-certificate me-2"></i>${prog.programme}
        </div>
        <span style="font-size:11.5px;color:var(--muted);">${prog.prog_id}</span>
      </div>
      <div class="content-box-body" style="padding:0;">
        ${sems.map(sem => `
          <div style="padding:14px 22px 6px;border-bottom:1px solid var(--border);background:var(--cream);">
            <div style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);">
              ${sem}
              ${sem === CURRENT_SEMESTER ? `<span style="background:var(--gold);color:var(--navy);padding:2px 8px;border-radius:5px;font-size:10px;margin-left:8px;">Current</span>` : ''}
            </div>
          </div>
          ${prog.courses.filter(c => c.semester === sem).map(course => {
            const isReg = registered.includes(course.code);
            return `
              <div style="padding:16px 22px;border-bottom:1px solid var(--border);display:flex;align-items:center;
                          gap:16px;flex-wrap:wrap;${isReg ? 'background:#f0fdf4;' : ''}">
                <div style="flex:1;min-width:200px;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    <span style="font-family:var(--mono);font-size:11.5px;color:var(--muted);font-weight:600;">${course.code}</span>
                    ${isReg ? `<span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:5px;font-size:10px;font-weight:600;">Registered</span>` : ''}
                  </div>
                  <div style="font-size:14px;font-weight:600;color:var(--navy);margin-bottom:2px;">${course.name}</div>
                  <div style="font-size:12px;color:var(--muted);">
                    ${course.credits} credit${course.credits !== 1 ? 's' : ''}
                    &nbsp;·&nbsp; Lecturer: ${course.lecturer}
                  </div>
                </div>
                <button class="reg-toggle-btn portal-btn"
                  data-code="${course.code}"
                  style="${isReg
                    ? 'background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;'
                    : 'background:var(--gold);color:var(--navy);'}">
                  <i class="ti ${isReg ? 'ti-x' : 'ti-plus'}"></i>
                  ${isReg ? 'Remove' : 'Register'}
                </button>
              </div>`;
          }).join('')}
        `).join('')}
      </div>
    </div>`;
}

function toggleCourse(code, user) {
  let registered = getRegistered();
  if (registered.includes(code)) {
    registered = registered.filter(c => c !== code);
  } else {
    registered.push(code);
  }
  saveRegistered(registered);
  renderCourses(user); // re-render
}

async function CoursesInit() {
  try {
    coursesCon.innerHTML = spinner();
    if (!schoolkey) { window.location.href = '/'; return; }

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` };

    const res  = await fetch('/auth/user-details', { headers });
    const data = await res.json();

    if (data.msg) { localStorage.removeItem('schoolKey'); window.location.href = '/'; return; }
    if (data?.user?.role !== 'student') { window.location.href = '/'; return; }

    renderCourses(data.user);

  } catch (err) {
    coursesCon.innerHTML = `<p class="text-center text-danger">Failed to load courses. Please refresh.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', CoursesInit);
