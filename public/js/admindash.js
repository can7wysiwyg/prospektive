const adminCon = document.getElementById('adminCon');
const schoolkey = localStorage.getItem('schoolKey');

async function LoadDash() {
  try {
    adminCon.innerHTML = `
      <div class="main-spinner text-center"><div class="spinner-border" role="status"></div><p class="mt-2" style="color:var(--muted);font-size:13px;">Loading…</p></div>`;

    if (!schoolkey) { window.location.href = '/'; return; }

    const res = await fetch('/auth/user-details', {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` }
    });
    const data = await res.json();

    if (data.msg) {
      localStorage.removeItem('schoolKey');
      adminCon.innerHTML = `<p class="text-danger text-center">${data.msg}</p>`;
      return;
    }

    if (data?.user?.role === 'admin') {
      adminCon.innerHTML = `
        <div class="welcome-banner">
          <h2>Admin Panel — <span class="name-highlight">Don Bosco</span></h2>
          <p>Manage students, lecturers, programs, and system data from this dashboard.</p>
        </div>

        <div class="page-header" style="margin-top:8px;">
          <h1>Administration</h1>
          <p>System management tools.</p>
        </div>

        <div class="card-grid">
          <div class="portal-card">
            <div class="portal-card-icon"><i class="ti ti-users-plus"></i></div>
            <h4>Add Students</h4>
            <p>Register new students into the system — individually or by bulk import.</p>
            <a href="/addmethod" class="portal-btn"><i class="ti ti-arrow-right"></i> Add Students</a>
          </div>
          <div class="portal-card">
            <div class="portal-card-icon"><i class="ti ti-chalkboard"></i></div>
            <h4>Lecturers</h4>
            <p>Add and manage lecturers, assign them to programs and departments.</p>
            <a href="/systemlecturers" class="portal-btn"><i class="ti ti-arrow-right"></i> Manage Lecturers</a>
          </div>
          <div class="portal-card">
            <div class="portal-card-icon"><i class="ti ti-id"></i></div>
            <h4>Students</h4>
            <p>Browse all registered students and manage their records.</p>
            <a href="/systemstudents" class="portal-btn"><i class="ti ti-arrow-right"></i> View Students</a>
          </div>
          <div class="portal-card">
            <div class="portal-card-icon"><i class="ti ti-certificate"></i></div>
            <h4>Programs</h4>
            <p>View academic programs and their enrolled student lists.</p>
            <a href="/progsstudents" class="portal-btn"><i class="ti ti-arrow-right"></i> View Programs</a>
          </div>
        </div>`;
    }
  } catch (err) {
    adminCon.innerHTML = `<p class="text-center text-danger">Failed to load dashboard.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', LoadDash);
