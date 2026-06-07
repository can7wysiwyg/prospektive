const sendGradesCon = document.getElementById('sendGradesCon');
const schoolkey     = localStorage.getItem('schoolKey');

// ── State ─────────────────────────────────────────────────────
let STATE = { user: null, enrolled: [], progDetails: null, activeTab: 'students' };

// Hash routing: /sendgrades#import or /sendgrades#students
const initTab = window.location.hash === '#import' ? 'import' : 'students';

function spinner() {
  return `<div class="main-spinner text-center" style="padding:60px 0;">
    <div class="spinner-border" role="status"></div>
    <p class="mt-2" style="color:var(--muted);font-size:13px;">Loading…</p>
  </div>`;
}

// ── Helpers ───────────────────────────────────────────────────
function initials(name = '') {
  return (name).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function avatar(name, size = 40) {
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--navy);color:var(--gold);
              display:flex;align-items:center;justify-content:center;font-size:${size * 0.3}px;
              font-weight:700;flex-shrink:0;">${initials(name)}</div>`;
}

// ── Tab shell ─────────────────────────────────────────────────
function renderShell(activeTab) {
  STATE.activeTab = activeTab;
  const prog = STATE.progDetails;
  const count = STATE.enrolled.length;

  const tab = (id, icon, label) => {
    const active = id === activeTab;
    return `<button class="tab-btn" data-tab="${id}" style="
      display:flex;align-items:center;gap:7px;padding:10px 18px;border:none;background:none;
      font-family:var(--font);font-size:13.5px;font-weight:${active ? 700 : 500};
      color:${active ? 'var(--gold)' : 'var(--muted)'};cursor:pointer;
      border-bottom:2px solid ${active ? 'var(--gold)' : 'transparent'};
      transition:color .15s,border-color .15s;white-space:nowrap;">
      <i class="ti ${icon}" style="font-size:16px;"></i>${label}
    </button>`;
  };

  sendGradesCon.innerHTML = `
    <!-- Header -->
    <div class="welcome-banner" style="margin-bottom:24px;">
      <h2><span class="name-highlight">${prog?.name || 'My Programme'}</span></h2>
      <p>Programme ID: <strong style="font-family:var(--mono);">${prog?.id || '—'}</strong>
         &nbsp;·&nbsp; <strong>${count}</strong> student${count !== 1 ? 's' : ''} enrolled</p>
    </div>

    <!-- Tabs -->
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);
                overflow:hidden;box-shadow:var(--shadow-sm);">
      <div style="display:flex;border-bottom:1px solid var(--border);padding:0 8px;overflow-x:auto;">
        ${tab('students',    'ti-users',            'Students')}
        ${tab('individual',  'ti-user-check',       'Grade a Student')}
        ${tab('import',      'ti-file-spreadsheet', 'Bulk Import')}
      </div>
      <div id="tabContent" style="padding:24px;">
        ${spinner()}
      </div>
    </div>`;

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      renderShell(btn.dataset.tab);
      renderTab(btn.dataset.tab);
    });
  });

  renderTab(activeTab);
}

// ── Tab: Students roster ──────────────────────────────────────
function renderStudentsTab() {
  const enrolled = STATE.enrolled;
  const tabContent = document.getElementById('tabContent');

  if (!enrolled.length) {
    tabContent.innerHTML = `
      <div style="text-align:center;padding:48px;">
        <i class="ti ti-user-off" style="font-size:40px;color:var(--muted);"></i>
        <p style="color:var(--muted);margin-top:14px;">No students enrolled in this programme yet.</p>
      </div>`;
    return;
  }

  tabContent.innerHTML = `
    <!-- Search bar -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
      <div style="flex:1;min-width:200px;position:relative;">
        <i class="ti ti-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);
           color:var(--muted);font-size:16px;pointer-events:none;"></i>
        <input id="stuSearch" type="text" placeholder="Search by name, email or phone…"
          style="width:100%;padding:10px 14px 10px 38px;border:1px solid var(--border);border-radius:9px;
                 background:var(--cream);font-size:13.5px;font-family:var(--font);color:var(--navy);" />
      </div>
      <div style="font-size:13px;color:var(--muted);white-space:nowrap;">
        <span id="stuCount">${enrolled.length}</span> student${enrolled.length !== 1 ? 's' : ''}
      </div>
    </div>

    <!-- Student grid -->
    <div class="student-grid" id="stuGrid">
      ${enrolled.map(s => studentCard(s)).join('')}
    </div>

    <!-- Grade modal (hidden) -->
    ${gradeModal()}`;

  // Search
  document.getElementById('stuSearch').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = q
      ? STATE.enrolled.filter(s =>
          s.fullname.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          String(s.phone || '').includes(q))
      : STATE.enrolled;

    document.getElementById('stuGrid').innerHTML = filtered.map(s => studentCard(s)).join('');
    document.getElementById('stuCount').textContent = filtered.length;
    attachCardListeners();
  });

  attachCardListeners();
}

function studentCard(s) {
  return `
    <div class="student-card open-grade-modal"
         data-id="${s._id}" data-email="${s.email}" data-name="${s.fullname}"
         style="cursor:pointer;">
      <div class="student-icon"><i class="ti ti-user"></i></div>
      <div class="student-name">${s.fullname}</div>
      <div class="student-info"><i class="ti ti-mail" style="font-size:12px;margin-right:4px;"></i>${s.email}</div>
      <div class="student-info"><i class="ti ti-phone" style="font-size:12px;margin-right:4px;"></i>${s.phone || 'N/A'}</div>
      <div style="margin-top:12px;">
        <span style="font-size:11.5px;background:var(--gold-glow);color:var(--gold);padding:3px 10px;
                     border-radius:6px;font-weight:600;">Click to grade</span>
      </div>
    </div>`;
}

function gradeModal() {
  return `
    <div id="gradeModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);
         z-index:500;align-items:center;justify-content:center;padding:20px;">
      <div style="background:var(--surface);border-radius:var(--radius-lg);width:100%;max-width:460px;
                  box-shadow:var(--shadow-lg);overflow:hidden;max-height:90vh;overflow-y:auto;">

        <div style="background:var(--navy);padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="color:rgba(255,255,255,.5);font-size:11.5px;margin-bottom:3px;">Grading</div>
            <div id="modalStudentName" style="color:#fff;font-weight:700;font-size:16px;"></div>
          </div>
          <button id="closeModal" style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,.1);
                  border:none;color:rgba(255,255,255,.7);font-size:18px;cursor:pointer;display:flex;
                  align-items:center;justify-content:center;">
            <i class="ti ti-x"></i>
          </button>
        </div>

        <div style="padding:24px;">
          <div id="modalStudentInfo" style="background:var(--cream);border-radius:10px;padding:14px;
               margin-bottom:20px;border:1px solid var(--border);font-size:13px;color:var(--muted);"></div>

          <div class="mb-3">
            <label class="form-label">Module Name <span style="color:var(--danger);">*</span></label>
            <input type="text" id="modalModule" class="form-control" placeholder="e.g. Introduction to Programming" />
          </div>

          <div class="mb-3">
            <label class="form-label">Grade <span style="color:var(--danger);">*</span></label>
            <select id="modalGrade" class="form-control" style="background:var(--cream);">
              <option value="">— Select Grade —</option>
              <option value="A">A — Excellent (4.0)</option>
              <option value="B">B — Good (3.0)</option>
              <option value="C">C — Average (2.0)</option>
              <option value="D">D — Below Average (1.0)</option>
              <option value="F">F — Fail (0.0)</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="form-label">Breakdown / Remarks <span style="font-size:11px;color:var(--muted);">(optional)</span></label>
            <textarea id="modalBreakdown" class="form-control" rows="3"
              placeholder="e.g. CA: 35/40, Exam: 55/60, Final: A"></textarea>
            <div style="font-size:11.5px;color:var(--muted);margin-top:5px;">
              This appears as the detailed grade breakdown for the student.
            </div>
          </div>

          <div id="modalMsg" style="margin-bottom:14px;display:none;"></div>

          <button id="submitGradeBtn" class="portal-btn" style="width:100%;justify-content:center;gap:8px;">
            <i class="ti ti-send"></i> Submit Grade
          </button>
        </div>
      </div>
    </div>`;
}

function attachCardListeners() {
  document.querySelectorAll('.open-grade-modal').forEach(card => {
    card.addEventListener('click', () => openGradeModal(card.dataset.id, card.dataset.email, card.dataset.name));
  });
}

function openGradeModal(id, email, name) {
  const modal = document.getElementById('gradeModal');
  document.getElementById('modalStudentName').textContent = name;
  document.getElementById('modalStudentInfo').innerHTML =
    `<strong>Email:</strong> ${email}<br><strong>ID:</strong> <span style="font-family:var(--mono);">${id}</span>`;
  document.getElementById('modalModule').value    = '';
  document.getElementById('modalGrade').value     = '';
  document.getElementById('modalBreakdown').value = '';
  document.getElementById('modalMsg').style.display = 'none';
  modal.style.display = 'flex';

  // Close
  document.getElementById('closeModal').onclick = () => { modal.style.display = 'none'; };
  modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

  // Submit
  document.getElementById('submitGradeBtn').onclick = () => submitGrade(id, email, name);
}

async function submitGrade(studentId, studentEmail, studentName) {
  const btn       = document.getElementById('submitGradeBtn');
  const msgEl     = document.getElementById('modalMsg');
  const module    = document.getElementById('modalModule').value.trim();
  const grade     = document.getElementById('modalGrade').value;
  const breakdown = document.getElementById('modalBreakdown').value.trim();

  msgEl.style.display = 'none';

  if (!module || !grade) {
    msgEl.style.display = 'block';
    msgEl.innerHTML = `<div style="background:#fee2e2;color:#dc2626;padding:10px 14px;border-radius:8px;font-size:13px;">
      Module name and grade are required.</div>`;
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Submitting…`;

  try {
    // Build grades_list: grade letter + optional breakdown
    const grades_list = breakdown ? `${grade}\n${breakdown}` : grade;

    const res  = await fetch('/lecturer/send-grades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` },
      body: JSON.stringify({ module_name: module, grades_list, studentId, studentEmail })
    });
    const data = await res.json();

    if (data.msg) {
      msgEl.style.display = 'block';
      msgEl.innerHTML = `<div style="background:#fee2e2;color:#dc2626;padding:10px 14px;border-radius:8px;font-size:13px;">${data.msg}</div>`;
      btn.disabled = false;
      btn.innerHTML = `<i class="ti ti-send"></i> Submit Grade`;
      return;
    }

    msgEl.style.display = 'block';
    msgEl.innerHTML = `<div style="background:#dcfce7;color:#16a34a;padding:10px 14px;border-radius:8px;font-size:13px;">
      ✅ Grade submitted successfully for <strong>${studentName}</strong>.</div>`;
    btn.innerHTML = `<i class="ti ti-circle-check-filled"></i> Submitted`;

    setTimeout(() => { document.getElementById('gradeModal').style.display = 'none'; }, 1600);

  } catch (err) {
    msgEl.style.display = 'block';
    msgEl.innerHTML = `<div style="background:#fee2e2;color:#dc2626;padding:10px 14px;border-radius:8px;font-size:13px;">Network error. Please try again.</div>`;
    btn.disabled = false;
    btn.innerHTML = `<i class="ti ti-send"></i> Submit Grade`;
  }
}

// ── Tab: Individual grade (search + grade one student) ────────
function renderIndividualTab() {
  const tabContent = document.getElementById('tabContent');
  const enrolled   = STATE.enrolled;

  tabContent.innerHTML = `
    <div style="max-width:560px;">
      <div style="margin-bottom:20px;">
        <div style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:4px;">Grade a Single Student</div>
        <div style="font-size:13px;color:var(--muted);">Search for a student by name or email, then fill in the grade form.</div>
      </div>

      <!-- Search -->
      <div class="mb-3" style="position:relative;">
        <label class="form-label">Find Student</label>
        <input id="indSearch" type="text" class="form-control" placeholder="Type name or email…" autocomplete="off" />
        <div id="indDropdown" style="position:absolute;top:100%;left:0;right:0;background:var(--surface);
             border:1px solid var(--border);border-radius:9px;box-shadow:var(--shadow);z-index:50;display:none;
             max-height:220px;overflow-y:auto;"></div>
      </div>

      <!-- Selected student badge -->
      <div id="selectedStudentBadge" style="display:none;background:var(--cream);border:1px solid var(--border);
           border-radius:10px;padding:14px;margin-bottom:18px;display:none;align-items:center;gap:12px;">
      </div>

      <div class="mb-3">
        <label class="form-label">Module Name <span style="color:var(--danger);">*</span></label>
        <input type="text" id="indModule" class="form-control" placeholder="e.g. Data Structures & Algorithms" />
      </div>

      <div class="mb-3">
        <label class="form-label">Grade <span style="color:var(--danger);">*</span></label>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;">
          ${['A','B','C','D','F'].map(l => `
            <label style="text-align:center;cursor:pointer;">
              <input type="radio" name="indGrade" value="${l}" style="display:none;" />
              <div class="grade-opt" data-letter="${l}" style="padding:12px 6px;border-radius:10px;
                   border:2px solid var(--border);font-size:20px;font-weight:700;font-family:var(--mono);
                   color:var(--muted);transition:all .15s;background:var(--cream);">${l}</div>
            </label>`).join('')}
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label">Breakdown / Remarks <span style="font-size:11px;color:var(--muted);">(optional)</span></label>
        <textarea id="indBreakdown" class="form-control" rows="3"
          placeholder="e.g. CA: 35/40, Exam: 55/60, Final: A"></textarea>
      </div>

      <div id="indMsg" style="display:none;margin-bottom:14px;"></div>

      <button id="indSubmitBtn" class="portal-btn" style="gap:8px;">
        <i class="ti ti-send"></i> Submit Grade
      </button>
    </div>`;

  // Grade pill selection
  document.querySelectorAll('.grade-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.grade-opt').forEach(o => {
        o.style.borderColor = 'var(--border)';
        o.style.color = 'var(--muted)';
        o.style.background = 'var(--cream)';
      });
      opt.style.borderColor = 'var(--gold)';
      opt.style.color = 'var(--navy)';
      opt.style.background = 'var(--gold-glow)';
      opt.closest('label').querySelector('input[type=radio]').checked = true;
    });
  });

  // Search dropdown
  let selectedStudent = null;
  const search = document.getElementById('indSearch');
  const dropdown = document.getElementById('indDropdown');

  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    selectedStudent = null;
    updateBadge(null);

    if (!q) { dropdown.style.display = 'none'; return; }

    const matches = enrolled.filter(s =>
      s.fullname.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)).slice(0, 8);

    if (!matches.length) {
      dropdown.innerHTML = `<div style="padding:14px;color:var(--muted);font-size:13px;">No students found.</div>`;
    } else {
      dropdown.innerHTML = matches.map(s => `
        <div class="ind-stu-opt" data-id="${s._id}" data-email="${s.email}" data-name="${s.fullname}"
          style="padding:12px 16px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">
          ${avatar(s.fullname, 32)}
          <div>
            <div style="font-size:13.5px;font-weight:600;color:var(--navy);">${s.fullname}</div>
            <div style="font-size:12px;color:var(--muted);">${s.email}</div>
          </div>
        </div>`).join('');
    }
    dropdown.style.display = 'block';

    dropdown.querySelectorAll('.ind-stu-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        selectedStudent = { _id: opt.dataset.id, email: opt.dataset.email, fullname: opt.dataset.name };
        search.value = opt.dataset.name;
        dropdown.style.display = 'none';
        updateBadge(selectedStudent);
      });
    });
  });

  document.addEventListener('click', e => {
    if (!search.contains(e.target) && !dropdown.contains(e.target)) dropdown.style.display = 'none';
  });

  function updateBadge(s) {
    const badge = document.getElementById('selectedStudentBadge');
    if (!s) { badge.style.display = 'none'; return; }
    badge.style.display = 'flex';
    badge.innerHTML = `${avatar(s.fullname, 40)}
      <div>
        <div style="font-size:14px;font-weight:700;color:var(--navy);">${s.fullname}</div>
        <div style="font-size:12.5px;color:var(--muted);">${s.email}</div>
      </div>
      <span style="margin-left:auto;background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;">Selected</span>`;
  }

  // Submit
  document.getElementById('indSubmitBtn').addEventListener('click', async () => {
    const btn      = document.getElementById('indSubmitBtn');
    const msgEl    = document.getElementById('indMsg');
    const module   = document.getElementById('indModule').value.trim();
    const gradeEl  = document.querySelector('input[name="indGrade"]:checked');
    const grade    = gradeEl?.value;
    const breakdown = document.getElementById('indBreakdown').value.trim();

    msgEl.style.display = 'none';

    if (!selectedStudent) {
      showMsg(msgEl, 'danger', 'Please select a student first.'); return;
    }
    if (!module) { showMsg(msgEl, 'danger', 'Module name is required.'); return; }
    if (!grade)  { showMsg(msgEl, 'danger', 'Please select a grade.'); return; }

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Submitting…`;

    try {
      const grades_list = breakdown ? `${grade}\n${breakdown}` : grade;
      const res  = await fetch('/lecturer/send-grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` },
        body: JSON.stringify({ module_name: module, grades_list, studentId: selectedStudent._id, studentEmail: selectedStudent.email })
      });
      const data = await res.json();

      if (data.msg) { showMsg(msgEl, 'danger', data.msg); btn.disabled = false; btn.innerHTML = `<i class="ti ti-send"></i> Submit Grade`; return; }

      showMsg(msgEl, 'success', `✅ Grade submitted for <strong>${selectedStudent.fullname}</strong>.`);
      btn.innerHTML = `<i class="ti ti-circle-check-filled"></i> Submitted`;
      // Reset
      setTimeout(() => {
        search.value = ''; selectedStudent = null; updateBadge(null);
        document.getElementById('indModule').value = '';
        document.getElementById('indBreakdown').value = '';
        document.querySelectorAll('.grade-opt').forEach(o => { o.style.borderColor='var(--border)'; o.style.color='var(--muted)'; o.style.background='var(--cream)'; });
        document.querySelectorAll('input[name="indGrade"]').forEach(r => r.checked = false);
        btn.disabled = false; btn.innerHTML = `<i class="ti ti-send"></i> Submit Grade`;
      }, 2000);
    } catch (err) {
      showMsg(msgEl, 'danger', 'Network error. Please try again.');
      btn.disabled = false; btn.innerHTML = `<i class="ti ti-send"></i> Submit Grade`;
    }
  });
}

// ── Tab: Bulk Excel import ────────────────────────────────────
function renderImportTab() {
  const tabContent = document.getElementById('tabContent');
  const prog = STATE.progDetails;

  tabContent.innerHTML = `
    <div style="max-width:600px;">
      <div style="margin-bottom:24px;">
        <div style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:4px;">Bulk Grade Import</div>
        <div style="font-size:13px;color:var(--muted);line-height:1.6;">
          Upload an Excel file with two columns: <code style="background:var(--cream);padding:1px 6px;border-radius:4px;font-size:12px;">student_email</code>
          and <code style="background:var(--cream);padding:1px 6px;border-radius:4px;font-size:12px;">grade</code>.
          The grade should be a single letter: A, B, C, D, or F.
        </div>
      </div>

      <!-- Template download -->
      <div style="background:var(--cream);border:1px solid var(--border);border-radius:10px;
           padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
        <i class="ti ti-file-spreadsheet" style="font-size:28px;color:#16a34a;flex-shrink:0;"></i>
        <div style="flex:1;">
          <div style="font-size:13.5px;font-weight:600;color:var(--navy);margin-bottom:2px;">Download Grade Template</div>
          <div style="font-size:12px;color:var(--muted);">Use this Excel template to fill in student grades correctly.</div>
        </div>
        <button id="downloadTemplate" class="portal-btn" style="gap:7px;background:var(--navy);color:var(--gold);">
          <i class="ti ti-download"></i> Template
        </button>
      </div>

      <!-- Module name -->
      <div class="mb-3">
        <label class="form-label">Module Name <span style="color:var(--danger);">*</span></label>
        <input type="text" id="importModule" class="form-control" placeholder="e.g. Database Management Systems" />
        <div style="font-size:11.5px;color:var(--muted);margin-top:4px;">Must exactly match the module you want to grade.</div>
      </div>

      <!-- Programme (auto-filled) -->
      <div class="mb-4">
        <label class="form-label">Programme</label>
        <input type="text" class="form-control" value="${prog?.id || ''}" disabled
          style="background:var(--cream);color:var(--muted);font-family:var(--mono);" />
        <div style="font-size:11.5px;color:var(--muted);margin-top:4px;">Auto-filled from your assigned programme.</div>
      </div>

      <!-- Drop zone -->
      <div class="mb-4">
        <label class="form-label">Excel File (.xlsx / .xls) <span style="color:var(--danger);">*</span></label>
        <div id="dropZone" style="border:2px dashed var(--border);border-radius:12px;padding:36px 24px;
             text-align:center;background:var(--cream);cursor:pointer;transition:border-color .2s,background .2s;">
          <i class="ti ti-cloud-upload" style="font-size:36px;color:var(--muted);margin-bottom:10px;display:block;"></i>
          <div style="font-size:14px;font-weight:600;color:var(--navy);margin-bottom:4px;">Drop your Excel file here</div>
          <div style="font-size:12.5px;color:var(--muted);margin-bottom:14px;">or click to browse</div>
          <input type="file" id="gradeFile" accept=".xlsx,.xls" style="display:none;" />
          <button type="button" onclick="document.getElementById('gradeFile').click()"
            style="background:var(--navy);color:var(--gold);border:none;padding:9px 20px;border-radius:8px;
                   font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font);">Browse File</button>
        </div>
        <div id="fileLabel" style="margin-top:8px;font-size:12.5px;color:var(--muted);"></div>
      </div>

      <div id="importMsg" style="display:none;margin-bottom:16px;"></div>

      <button id="importBtn" class="portal-btn" style="gap:8px;">
        <i class="ti ti-upload"></i> Import Grades
      </button>

      <!-- Results panel -->
      <div id="importResults" style="display:none;margin-top:28px;"></div>
    </div>`;

  // Drag and drop
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('gradeFile');

  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor='var(--gold)'; dropZone.style.background='var(--gold-glow)'; });
  dropZone.addEventListener('dragleave', ()=> { dropZone.style.borderColor='var(--border)'; dropZone.style.background='var(--cream)'; });
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.style.borderColor='var(--border)'; dropZone.style.background='var(--cream)';
    const file = e.dataTransfer.files[0];
    if (file) { fileInput.files = e.dataTransfer.files; showFilePicked(file.name); }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) showFilePicked(fileInput.files[0].name);
  });

  function showFilePicked(name) {
    document.getElementById('fileLabel').innerHTML =
      `<span style="color:var(--navy);font-weight:600;"><i class="ti ti-paperclip" style="font-size:12px;margin-right:4px;"></i>${name}</span>`;
    dropZone.style.borderColor = 'var(--gold)';
  }

  // Template download
  document.getElementById('downloadTemplate').addEventListener('click', () => {
    // Build a minimal CSV template
    const csv = 'student_email,grade\nstudent@example.com,A\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'grade_template.csv'; a.click();
    URL.revokeObjectURL(url);
  });

  // Import
  document.getElementById('importBtn').addEventListener('click', async () => {
    const btn    = document.getElementById('importBtn');
    const msgEl  = document.getElementById('importMsg');
    const module = document.getElementById('importModule').value.trim();
    const file   = document.getElementById('gradeFile').files[0];

    msgEl.style.display = 'none';

    if (!module) { showMsg(msgEl, 'danger', 'Module name is required.'); return; }
    if (!file)   { showMsg(msgEl, 'danger', 'Please select an Excel file.'); return; }

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Uploading…`;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module_name', module);
      formData.append('program', prog?.id || '');

      const res  = await fetch('/lecturer/import-grades', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${schoolkey}` },
        body: formData
      });
      const data = await res.json();

      if (data.msg) { showMsg(msgEl, 'danger', data.msg); btn.disabled = false; btn.innerHTML = `<i class="ti ti-upload"></i> Import Grades`; return; }

      showMsg(msgEl, 'success', data.message);
      btn.disabled = false;
      btn.innerHTML = `<i class="ti ti-upload"></i> Import Grades`;

      // Render results report
      renderImportResults(data.results, module);

    } catch (err) {
      showMsg(msgEl, 'danger', 'Upload failed. Please try again.');
      btn.disabled = false;
      btn.innerHTML = `<i class="ti ti-upload"></i> Import Grades`;
    }
  });
}

function renderImportResults(results, module) {
  const el = document.getElementById('importResults');
  const { imported = [], skipped = [], errors = [] } = results;

  el.style.display = 'block';
  el.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;">
      <div style="background:var(--navy);padding:16px 20px;">
        <div style="color:rgba(255,255,255,.6);font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px;">Import Report</div>
        <div style="color:#fff;font-weight:700;font-size:15px;">${module}</div>
      </div>

      <!-- Summary -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--border);">
        <div style="padding:16px;text-align:center;border-right:1px solid var(--border);">
          <div style="font-size:24px;font-weight:700;color:#16a34a;font-family:var(--mono);">${imported.length}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;">Imported</div>
        </div>
        <div style="padding:16px;text-align:center;border-right:1px solid var(--border);">
          <div style="font-size:24px;font-weight:700;color:#d97706;font-family:var(--mono);">${skipped.length}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;">Skipped</div>
        </div>
        <div style="padding:16px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#dc2626;font-family:var(--mono);">${errors.length}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;">Errors</div>
        </div>
      </div>

      <div style="padding:16px 20px;">
        ${imported.length ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:12px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">
            ✅ Successfully Imported
          </div>
          ${imported.map(r => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;
                 border-bottom:1px solid var(--border);font-size:13px;">
              <span style="color:var(--navy);">${r.email}</span>
              <span style="background:#dcfce7;color:#16a34a;padding:2px 10px;border-radius:6px;
                           font-weight:700;font-family:var(--mono);font-size:12px;">${r.grade}</span>
            </div>`).join('')}
        </div>` : ''}

        ${skipped.length ? `
        <div style="margin-bottom:16px;">
          <div style="font-size:12px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">
            ⚠ Skipped
          </div>
          ${skipped.map(r => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;
                 border-bottom:1px solid var(--border);font-size:13px;">
              <span style="color:var(--navy);">${r.email}</span>
              <span style="color:var(--muted);font-size:12px;">${r.reason}</span>
            </div>`).join('')}
        </div>` : ''}

        ${errors.length ? `
        <div>
          <div style="font-size:12px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">
            ✕ Errors
          </div>
          ${errors.map(r => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;
                 border-bottom:1px solid var(--border);font-size:13px;">
              <span style="color:var(--navy);">${r.email || '(unknown)'}</span>
              <span style="color:#dc2626;font-size:12px;">${r.reason}</span>
            </div>`).join('')}
        </div>` : ''}
      </div>
    </div>`;

  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Route to correct tab ──────────────────────────────────────
function renderTab(tab) {
  if      (tab === 'students')   renderStudentsTab();
  else if (tab === 'individual') renderIndividualTab();
  else if (tab === 'import')     renderImportTab();
}

// ── Shared msg helper ─────────────────────────────────────────
function showMsg(el, type, html) {
  const colors = {
    danger:  { bg:'#fee2e2', color:'#dc2626' },
    success: { bg:'#dcfce7', color:'#16a34a' },
    warning: { bg:'#fef9c3', color:'#92400e' },
  };
  const c = colors[type] || colors.danger;
  el.style.display = 'block';
  el.innerHTML = `<div style="background:${c.bg};color:${c.color};padding:10px 14px;border-radius:8px;font-size:13px;">${html}</div>`;
}

// ── Entry point ───────────────────────────────────────────────
async function SendGrades() {
  try {
    sendGradesCon.innerHTML = spinner();
    if (!schoolkey) { window.location.href = '/'; return; }

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` };

    const [userRes, progRes] = await Promise.all([
      fetch('/auth/user-details',       { headers }),
      fetch('/lecture/course-students', { headers }),
    ]);

    const [userData, progData] = await Promise.all([userRes.json(), progRes.json()]);

    if (userData.msg) { localStorage.removeItem('schoolKey'); window.location.href = '/'; return; }
    if (userData?.user?.role !== 'lecturer') { window.location.href = '/'; return; }

    if (progData.msg) {
      sendGradesCon.innerHTML = `
        <div class="content-box" style="text-align:center;padding:56px;">
          <i class="ti ti-alert-circle" style="font-size:40px;color:var(--danger);"></i>
          <p style="margin-top:14px;color:var(--muted);">${progData.msg}</p>
          <a href="/lecturertasks" class="portal-btn" style="margin-top:16px;display:inline-flex;gap:7px;">
            <i class="ti ti-arrow-left"></i> Back to Dashboard
          </a>
        </div>`;
      return;
    }

    STATE.user        = userData.user;
    STATE.enrolled    = progData.enrolled   || [];
    STATE.progDetails = progData.prog_details || null;

    renderShell(initTab);

  } catch (err) {
    sendGradesCon.innerHTML = `<p class="text-center text-danger">Failed to load page. Please refresh.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', SendGrades);