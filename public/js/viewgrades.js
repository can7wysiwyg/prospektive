const myGrdsCon = document.getElementById('myGrdsCon');
const schoolkey = localStorage.getItem('schoolKey');

async function ViewGrades() {
  try {
    myGrdsCon.innerHTML = `<div class="main-spinner text-center"><div class="spinner-border" role="status"></div><p class="mt-2" style="color:var(--muted);font-size:13px;">Loading grades…</p></div>`;

    if (!schoolkey) { window.location.href = '/'; return; }

    const res = await fetch('/auth/user-details', {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` }
    });
    const data = await res.json();

    if (data.msg) { localStorage.removeItem('schoolKey'); myGrdsCon.innerHTML = `<p class="text-danger text-center">${data.msg}</p>`; return; }

    if (data?.user?.role === 'student') {
      const gradesRes = await fetch('/student/get-my-grades', {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` }
      });
      const gradesData = await gradesRes.json();

      if (gradesData?.msg) { myGrdsCon.innerHTML = `<p class="text-danger text-center">${gradesData.msg}</p>`; return; }

      const grades = gradesData?.grades;

      myGrdsCon.innerHTML = `
        <div class="page-header">
          <h1>My Grades</h1>
          <p>Academic performance and module grade breakdown.</p>
        </div>

        ${grades?.length
          ? grades.map(g => {
              const list = g.grades_list ? g.grades_list.split('\n').filter(x => x.trim()) : [];
              return `
                <div class="grade-card">
                  <div class="grade-title">${g.module_name}</div>
                  <div class="grade-meta">Module Grade Breakdown</div>
                  <div>${list.map(item => `<span class="badge-grade">${item}</span>`).join('')}</div>
                  <div class="lecturer">
                    <strong>Lecturer:</strong> ${g.lctr?.fullname}<br>
                    <small>${g.lctr?.email}</small>
                  </div>
                </div>`;
            }).join('')
          : `<div class="content-box" style="text-align:center;padding:48px;"><i class="ti ti-clipboard-off" style="font-size:36px;color:var(--muted);"></i><p style="color:var(--muted);margin-top:12px;">No grades available yet.</p></div>`
        }`;
    }
  } catch (err) {
    myGrdsCon.innerHTML = `<p class="text-center text-danger">Failed to load grades.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', ViewGrades);
