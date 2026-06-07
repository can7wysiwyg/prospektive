const myGrdsCon = document.getElementById('myGrdsCon');
const schoolkey  = localStorage.getItem('schoolKey');

// ── Grade helpers ─────────────────────────────────────────────
function gradePoint(g = '') {
  const map = { A:4.0, B:3.0, C:2.0, D:1.0, F:0.0 };
  return map[g.trim().toUpperCase().charAt(0)] ?? null;
}

function pointsToLetter(p) {
  if (p >= 3.7) return 'A';
  if (p >= 3.0) return 'B';
  if (p >= 2.0) return 'C';
  if (p >= 1.0) return 'D';
  return 'F';
}

const GRADE_COLORS = {
  A: { bg:'#dcfce7', color:'#15803d', border:'#86efac' },
  B: { bg:'#dbeafe', color:'#1d4ed8', border:'#93c5fd' },
  C: { bg:'#fef9c3', color:'#92400e', border:'#fde047' },
  D: { bg:'#ffedd5', color:'#c2410c', border:'#fdba74' },
  F: { bg:'#fee2e2', color:'#b91c1c', border:'#fca5a5' },
};

function gradeStyle(letter) {
  return GRADE_COLORS[letter.toUpperCase()] || { bg:'#f3f4f6', color:'#374151', border:'#d1d5db' };
}

// Parse the stored grade string (e.g. "A", "B+", "CA:70\nExam:80\nFinal:A")
function parseMainGrade(raw = '') {
  if (!raw) return '—';
  const simple = raw.trim();
  if (simple.length <= 2) return simple.charAt(0).toUpperCase();
  const match = raw.match(/(?:overall|final|grade)[:\s]+([A-Fa-f][+-]?)/i);
  if (match) return match[1].toUpperCase().charAt(0);
  const letters = raw.match(/\b([A-Fa-f])\b/g);
  return letters ? letters[letters.length - 1].toUpperCase() : '—';
}

// Break a grades_list string into individual badge entries
function parseBreakdown(raw = '') {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

// ── Spinner ───────────────────────────────────────────────────
function spinner() {
  return `<div class="main-spinner text-center" style="padding:60px 0;">
    <div class="spinner-border" role="status"></div>
    <p class="mt-2" style="color:var(--muted);font-size:13px;">Fetching your grades…</p>
  </div>`;
}

async function ViewGrades() {
  try {
    myGrdsCon.innerHTML = spinner();
    if (!schoolkey) { window.location.href = '/'; return; }

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` };

    const [userRes, gradesRes] = await Promise.all([
      fetch('/auth/user-details', { headers }),
      fetch('/student/get-my-grades', { headers })
    ]);

    const [userData, gradesData] = await Promise.all([userRes.json(), gradesRes.json()]);

    if (userData.msg) { localStorage.removeItem('schoolKey'); window.location.href = '/'; return; }
    if (userData?.user?.role !== 'student') { window.location.href = '/'; return; }

    const grades = gradesData.grades || [];

    // ── Compute overall ───────────────────────────────────────
    let gpa = null; let overallLetter = null;
    if (grades.length) {
      const points = grades
        .map(g => gradePoint(parseMainGrade(g.grade)))
        .filter(p => p !== null);
      if (points.length) {
        gpa = (points.reduce((a, b) => a + b, 0) / points.length).toFixed(2);
        overallLetter = pointsToLetter(parseFloat(gpa));
      }
    }

    const ovStyle = overallLetter ? gradeStyle(overallLetter) : null;

    myGrdsCon.innerHTML = `
      <div class="page-header">
        <h1>My Grades</h1>
        <p>Academic performance for all modules.</p>
      </div>

      ${overallLetter ? `
      <!-- Overall summary banner -->
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);
                  padding:24px 28px;margin-bottom:24px;display:flex;align-items:center;gap:24px;
                  flex-wrap:wrap;box-shadow:var(--shadow-sm);">
        <div style="width:72px;height:72px;border-radius:16px;
                    background:${ovStyle.bg};border:2px solid ${ovStyle.border};
                    display:flex;align-items:center;justify-content:center;
                    font-size:34px;font-weight:700;color:${ovStyle.color};
                    font-family:var(--mono);flex-shrink:0;">${overallLetter}</div>
        <div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:4px;">Overall Performance</div>
          <div style="font-size:22px;font-weight:700;color:var(--navy);letter-spacing:-0.02em;">
            GPA &nbsp;<span style="font-family:var(--mono);">${gpa}</span> / 4.00
          </div>
          <div style="font-size:12.5px;color:var(--muted);margin-top:4px;">
            Based on ${grades.length} graded module${grades.length !== 1 ? 's' : ''}
          </div>
        </div>

        <!-- Grade scale legend -->
        <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;">
          ${['A','B','C','D','F'].map(l => {
            const s = gradeStyle(l);
            return `<span style="padding:4px 11px;border-radius:7px;font-size:12px;font-weight:600;
                                 background:${s.bg};color:${s.color};border:1px solid ${s.border};
                                 font-family:var(--mono);">${l}</span>`;
          }).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Grade cards -->
      ${grades.length === 0
        ? `<div class="content-box" style="text-align:center;padding:56px 24px;">
             <i class="ti ti-clipboard-off" style="font-size:40px;color:var(--muted);"></i>
             <p style="color:var(--muted);margin-top:14px;font-size:14px;">No grades have been recorded yet.</p>
           </div>`
        : grades.map((g, i) => {
            const mainGrade = parseMainGrade(g.grade);
            const breakdown = parseBreakdown(g.grade);
            const ms = gradeStyle(mainGrade !== '—' ? mainGrade : 'F');
            const pts = gradePoint(mainGrade);

            return `
              <div class="grade-card" style="margin-bottom:14px;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">

                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                      <span style="font-size:11px;font-weight:600;color:var(--muted);font-family:var(--mono);">
                        #${String(i+1).padStart(2,'0')}
                      </span>
                      <div class="grade-title" style="margin:0;">${g.module_name}</div>
                    </div>
                    <div class="grade-meta">Programme: <strong>${g.program || 'N/A'}</strong></div>

                    <!-- Breakdown badges -->
                    ${breakdown.length > 1 ? `
                    <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px;">
                      ${breakdown.map(item => {
                        // Detect if item contains a letter grade at the end
                        const letter = item.match(/([A-Fa-f])\s*$/)?.[1]?.toUpperCase();
                        const bs = letter ? gradeStyle(letter) : { bg:'var(--cream)', color:'var(--navy)', border:'var(--border)' };
                        return `<span style="padding:5px 12px;border-radius:7px;font-size:12px;font-weight:500;
                                             background:${bs.bg};color:${bs.color};border:1px solid ${bs.border};
                                             font-family:var(--mono);">${item}</span>`;
                      }).join('')}
                    </div>` : ''}
                  </div>

                  <!-- Grade badge -->
                  <div style="width:60px;height:60px;border-radius:14px;flex-shrink:0;
                              background:${ms.bg};border:2px solid ${ms.border};
                              display:flex;align-items:center;justify-content:center;
                              font-size:26px;font-weight:700;color:${ms.color};
                              font-family:var(--mono);">${mainGrade}</div>

                </div>

                <!-- Lecturer -->
                <div class="lecturer" style="margin-top:14px;padding-top:14px;">
                  <span style="color:var(--muted);">Lecturer:</span>
                  <strong>${g.lctr?.fullname || 'N/A'}</strong>
                  <span style="color:var(--muted-light);font-size:11.5px;">&nbsp;·&nbsp;${g.lctr?.email || ''}</span>
                  ${pts !== null ? `<span style="float:right;font-size:11.5px;color:var(--muted);font-family:var(--mono);">
                    GPA points: <strong style="color:var(--navy);">${pts.toFixed(1)}</strong></span>` : ''}
                </div>
              </div>`;
          }).join('')
      }`;

  } catch (err) {
    myGrdsCon.innerHTML = `<p class="text-center text-danger">Failed to load grades. Please refresh.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', ViewGrades);
