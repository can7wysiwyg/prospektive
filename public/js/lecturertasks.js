const lecTaskCon = document.getElementById('lecTaskCon');
const schoolkey = localStorage.getItem('schoolKey');

async function Lecturer() {
  try {
    lecTaskCon.innerHTML = `
      <div class="main-spinner text-center"><div class="spinner-border" role="status"></div><p class="mt-2" style="color:var(--muted);font-size:13px;">Loading…</p></div>`;

    if (!schoolkey) { window.location.href = '/'; return; }

    const res = await fetch('/auth/user-details', {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` }
    });
    const data = await res.json();

    if (data.msg) {
      localStorage.removeItem('schoolKey');
      lecTaskCon.innerHTML = `<p class="text-danger text-center">${data.msg}</p>`;
      return;
    }

    if (data?.user?.role === 'lecturer') {
      lecTaskCon.innerHTML = `
        <div class="welcome-banner">
          <h2>Welcome, <span class="name-highlight">${data.user.fullname}</span></h2>
          <p>Manage your program, view enrolled students, and upload academic results.</p>
        </div>

        <div class="page-header" style="margin-top:8px;">
          <h1>Lecturer Dashboard</h1>
        </div>

        <div class="card-grid">
          <div class="portal-card">
            <div class="portal-card-icon"><i class="ti ti-report-analytics"></i></div>
            <h4>My Program & Students</h4>
            <p>Manage your assigned program, view enrolled students, and upload grade results.</p>
            <a href="/sendgrades" class="portal-btn"><i class="ti ti-arrow-right"></i> Manage</a>
          </div>
        </div>`;
    }
  } catch (err) {
    lecTaskCon.innerHTML = `<p class="text-center text-danger">Failed to load page.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', Lecturer);
