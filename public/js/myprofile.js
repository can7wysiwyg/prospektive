const uProfCon = document.getElementById('uProfCon');
const schoolkey = localStorage.getItem('schoolKey');

async function MyProfile() {
  try {
    uProfCon.innerHTML = `<div class="main-spinner text-center"><div class="spinner-border" role="status"></div><p class="mt-2" style="color:var(--muted);font-size:13px;">Loading profile…</p></div>`;

    if (!schoolkey) { window.location.href = '/'; return; }

    const res = await fetch('/auth/user-details', {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` }
    });
    const data = await res.json();

    if (data.msg) { localStorage.removeItem('schoolKey'); uProfCon.innerHTML = `<p class="text-danger text-center">${data.msg}</p>`; return; }

    if (data?.user?.role === 'student') {
      const stuRes = await fetch('/student/get-student', {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` }
      });
      const stuData = await stuRes.json();

      if (stuData.msg) { uProfCon.innerHTML = `<p class="text-danger text-center">${stuData.msg}</p>`; return; }

      const student = stuData.student;

      uProfCon.innerHTML = `
        <div class="page-header">
          <h1>My Profile</h1>
          <p>Your personal and academic information.</p>
        </div>

        <div class="profile-card">
          <div class="avatar"><i class="ti ti-user"></i></div>
          <h3 class="profile-title">${student.fullname}</h3>

          <div class="mb-3">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" value="${student.fullname}" disabled />
          </div>
          <div class="mb-3">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" value="${student.email}" disabled />
          </div>
          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input type="text" class="form-control" value="${student.phone}" disabled />
          </div>
          <div class="mb-4">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" value="************" disabled />
          </div>
          <button type="button" class="update-btn" disabled>Update Profile</button>
        </div>`;
    }
  } catch (err) {
    uProfCon.innerHTML = `<p class="text-center text-danger">Failed to load profile.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', MyProfile);
