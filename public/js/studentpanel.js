const stuPanelCon = document.getElementById('stuPanelCon');
const schoolkey = localStorage.getItem('schoolKey');

async function StudentPanel() {
  try {
    stuPanelCon.innerHTML = `
      <div class="main-spinner text-center"><div class="spinner-border" role="status"></div><p class="mt-2" style="color:var(--muted);font-size:13px;">Loading…</p></div>`;

    if (!schoolkey) { window.location.href = '/'; return; }

    const res = await fetch('/auth/user-details', {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` }
    });
    const data = await res.json();

    if (data.msg) {
      localStorage.removeItem('schoolKey');
      stuPanelCon.innerHTML = `<p class="text-danger text-center">${data.msg}</p>`;
      return;
    }

    if (data?.user?.role === 'student') {
      stuPanelCon.innerHTML = `
        <div class="welcome-banner">
          <h2>Welcome back, <span class="name-highlight">${data.user.fullname}</span></h2>
          <p>Access your profile, view your grades, and check your fees status from here.</p>
        </div>

        <div class="page-header" style="margin-top:8px;">
          <h1>Student Dashboard</h1>
          <p>Everything you need in one place.</p>
        </div>

        <div class="card-grid">
          <div class="portal-card">
            <div class="portal-card-icon"><i class="ti ti-user"></i></div>
            <h4>My Profile</h4>
            <p>View your personal information and academic details.</p>
            <a href="/myprofile" class="portal-btn"><i class="ti ti-arrow-right"></i> Open Profile</a>
          </div>
          <div class="portal-card">
            <div class="portal-card-icon"><i class="ti ti-clipboard-data"></i></div>
            <h4>My Grades</h4>
            <p>View your academic performance and module grade breakdown.</p>
            <a href="/viewgrades" class="portal-btn"><i class="ti ti-arrow-right"></i> View Grades</a>
          </div>
          <div class="portal-card">
            <div class="portal-card-icon"><i class="ti ti-cash"></i></div>
            <h4>Fees & Payments</h4>
            <p>Monitor your fee payment status and financial account.</p>
            <a href="/myfees" class="portal-btn"><i class="ti ti-arrow-right"></i> View Fees</a>
          </div>
        </div>`;
    }
  } catch (err) {
    stuPanelCon.innerHTML = `<p class="text-center text-danger">Failed to load dashboard.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', StudentPanel);
