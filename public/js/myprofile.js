const uProfCon = document.getElementById('uProfCon');
const schoolkey = localStorage.getItem('schoolKey');

function spinner() {
  return `<div class="main-spinner text-center" style="padding:60px 0;">
    <div class="spinner-border" role="status"></div>
    <p class="mt-2" style="color:var(--muted);font-size:13px;">Loading profile…</p>
  </div>`;
}

function field(label, value, icon, mono = false) {
  return `
    <div style="padding:16px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:14px;">
      <div style="width:34px;height:34px;border-radius:9px;background:var(--cream);border:1px solid var(--border);
                  display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:17px;flex-shrink:0;">
        <i class="ti ${icon}"></i>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted-light);font-weight:600;margin-bottom:2px;">${label}</div>
        <div style="font-size:14px;color:var(--navy);font-weight:500;${mono ? 'font-family:var(--mono);' : ''}word-break:break-word;">
          ${value || '<span style="color:var(--muted-light);font-style:italic;">Not provided</span>'}
        </div>
      </div>
    </div>`;
}

async function MyProfile() {
  try {
    uProfCon.innerHTML = spinner();
    if (!schoolkey) { window.location.href = '/'; return; }

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` };

    const [userRes, stuRes] = await Promise.all([
      fetch('/auth/user-details', { headers }),
      fetch('/student/get-student', { headers })
    ]);

    const [userData, stuData] = await Promise.all([userRes.json(), stuRes.json()]);

    if (userData.msg) { localStorage.removeItem('schoolKey'); window.location.href = '/'; return; }
    if (userData?.user?.role !== 'student') { window.location.href = '/'; return; }

    if (stuData.msg) {
      uProfCon.innerHTML = `<p class="text-danger text-center">${stuData.msg}</p>`;
      return;
    }

    const s = stuData.student;
    const initials = (s.fullname || 'S').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    // Format DOB
    const dobFormatted = s.dob
      ? new Date(s.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : null;

    // Member since
    const since = s.createdAt
      ? new Date(s.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      : null;

    uProfCon.innerHTML = `
      <div class="page-header">
        <h1>My Profile</h1>
        <p>Your personal and academic information.</p>
      </div>

      <div class="row g-4">

        <!-- Left: avatar + summary card -->
        <div class="col-lg-4">
          <div class="content-box" style="text-align:center;padding:32px 24px;">

            <!-- Avatar -->
            <div style="width:86px;height:86px;border-radius:50%;background:var(--navy);color:var(--gold);
                        display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700;
                        margin:0 auto 16px;border:3px solid var(--gold-glow);">${initials}</div>

            <div style="font-size:18px;font-weight:700;color:var(--navy);margin-bottom:4px;">${s.fullname}</div>
            <div style="font-size:12.5px;color:var(--muted);margin-bottom:18px;">${s.program || 'Student'}</div>

            <!-- Reg badge -->
            <div style="display:inline-block;background:var(--navy);color:var(--gold);padding:7px 18px;
                        border-radius:9px;font-family:var(--mono);font-size:13.5px;font-weight:600;
                        letter-spacing:.05em;margin-bottom:22px;">${s.student_reg || 'REG N/A'}</div>

            <!-- Summary fields -->
            <div style="text-align:left;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted-light);
                          font-weight:600;margin-bottom:10px;">Quick Info</div>

              <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);">
                <i class="ti ti-gender-bigender" style="color:var(--muted);font-size:16px;width:18px;"></i>
                <span style="font-size:13px;color:var(--navy);">${s.gender || 'Not specified'}</span>
              </div>
              <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);">
                <i class="ti ti-mail" style="color:var(--muted);font-size:16px;width:18px;"></i>
                <span style="font-size:13px;color:var(--navy);word-break:break-all;">${s.email}</span>
              </div>
              <div style="display:flex;align-items:center;gap:10px;padding:9px 0;">
                <i class="ti ti-calendar" style="color:var(--muted);font-size:16px;width:18px;"></i>
                <span style="font-size:13px;color:var(--muted);">Member since ${since || 'N/A'}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Right: full details -->
        <div class="col-lg-8">
          <div class="content-box">
            <div class="content-box-header">
              <div class="content-box-title"><i class="ti ti-id me-2"></i>Student Details</div>
              <span style="font-size:11.5px;color:var(--muted);">Read-only — contact admin to update</span>
            </div>
            <div class="content-box-body">

              <div style="margin-bottom:4px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted-light);
                            font-weight:600;padding-bottom:10px;border-bottom:2px solid var(--border);margin-bottom:0;">
                  Personal Information
                </div>
                ${field('Full Name',            s.fullname,      'ti-user')}
                ${field('Date of Birth',        dobFormatted,    'ti-calendar')}
                ${field('Gender',               s.gender,        'ti-gender-bigender')}
                ${field('Phone Number',         s.phone ? '+265 ' + s.phone : null, 'ti-phone', true)}
                ${field('Email Address',        s.email,         'ti-mail')}
              </div>

              <div style="margin-top:20px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted-light);
                            font-weight:600;padding-bottom:10px;border-bottom:2px solid var(--border);margin-bottom:0;">
                  Academic Information
                </div>
                ${field('Registration Number', s.student_reg,   'ti-id-badge-2', true)}
                ${field('Programme / Course',  s.program,       'ti-certificate')}
                ${field('Account Role',        s.role,          'ti-shield-half')}
                ${field('Enrolled',            since ? 'Since ' + since : null, 'ti-calendar-stats')}
              </div>

            </div>
          </div>
        </div>

      </div>`;

  } catch (err) {
    uProfCon.innerHTML = `<p class="text-center text-danger">Failed to load profile. Please refresh.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', MyProfile);
