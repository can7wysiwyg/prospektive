// ── PDF Generation ────────────────────────────────────────────
async function generateClearancePDF(user, fees) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;

  // ── helpers ──────────────────────────────────────────────────
  const centerText = (text, y, size = 12, style = 'normal', color = [20, 30, 70]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
    doc.text(text, pageW / 2, y, { align: 'center' });
  };

  const leftText = (text, x, y, size = 11, style = 'normal', color = [30, 30, 30]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
    doc.text(text, x, y);
  };

  const rightText = (text, x, y, size = 11, style = 'normal', color = [30, 30, 30]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
    doc.text(text, x, y, { align: 'right' });
  };

  const drawLine = (y, color = [200, 200, 200], thickness = 0.3) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(thickness);
    doc.line(margin, y, pageW - margin, y);
  };

  const drawRect = (x, y, w, h, fillColor) => {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, w, h, 2, 2, 'F');
  };

  // ── HEADER BAND ───────────────────────────────────────────────
  doc.setFillColor(14, 30, 70); // navy
  doc.rect(0, 0, pageW, 42, 'F');

  // Gold accent bar
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 42, pageW, 3, 'F');

  // School name
  centerText('DON BOSCO COLLEGE', 16, 16, 'bold', [255, 255, 255]);
  centerText('Office of Academic Affairs', 24, 9, 'normal', [200, 200, 200]);
  centerText('STUDENT FEE CLEARANCE CERTIFICATE', 34, 10, 'bold', [212, 175, 55]);

  // ── DOCUMENT META (top right) ─────────────────────────────────
  const now = new Date();
  const docDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const refNo   = `REF-${user.student_reg || 'N/A'}-${now.getFullYear()}`;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text(`Issued: ${docDate}`, pageW - margin, 10, { align: 'right' });
  doc.text(`Ref: ${refNo}`, pageW - margin, 16, { align: 'right' });

  // ── CLEARANCE STATUS BADGE ────────────────────────────────────
  const badgeY = 54;
  drawRect(margin, badgeY, contentW, 18, [220, 252, 231]); // green bg
  doc.setDrawColor(134, 239, 172);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, badgeY, contentW, 18, 2, 2, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('✓  CLEARED — Fees Fully Settled', pageW / 2, badgeY + 11, { align: 'center' });

  // ── STUDENT DETAILS ───────────────────────────────────────────
  let y = 85;
  leftText('STUDENT INFORMATION', margin, y, 8, 'bold', [120, 120, 120]);
  y += 2; drawLine(y, [220, 220, 220]);
  y += 7;

  const details = [
    ['Full Name',    user.fullname   || 'N/A'],
    ['Reg Number',   user.student_reg || 'N/A'],
    ['Programme',    user.program     || 'N/A'],
    ['Academic Year','2025 / 2026'],
    ['Status',       'Cleared'],
  ];

  details.forEach(([label, value]) => {
    leftText(label,  margin,      y, 10, 'normal', [100, 100, 100]);
    leftText(value,  margin + 48, y, 10, 'bold',   [20, 30, 70]);
    y += 9;
  });

  // ── FEE BREAKDOWN TABLE ───────────────────────────────────────
  y += 4;
  leftText('FEE BREAKDOWN', margin, y, 8, 'bold', [120, 120, 120]);
  y += 2; drawLine(y, [220, 220, 220]);
  y += 2;

  // Table header
  drawRect(margin, y, contentW, 10, [14, 30, 70]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Description',  margin + 4,           y + 6.5);
  doc.text('Amount (MWK)', pageW - margin - 4,   y + 6.5, { align: 'right' });
  doc.text('Status',       pageW - margin - 50,  y + 6.5, { align: 'center' });
  y += 10;

  FEE_STRUCTURE.forEach((item, i) => {
    const rowBg = i % 2 === 0 ? [255, 255, 255] : [248, 248, 245];
    drawRect(margin, y, contentW, 9, rowBg);

    leftText(item.label,                 margin + 4,          y + 6, 9.5, 'normal', [30, 30, 60]);
    rightText(formatMWK(item.amount),    pageW - margin - 50, y + 6, 9.5, 'normal', [30, 30, 60]);

    // Paid badge
    drawRect(pageW - margin - 46, y + 1.5, 20, 6, [220, 252, 231]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text('PAID', pageW - margin - 36, y + 6, { align: 'center' });

    y += 9;
  });

  // Total row
  drawRect(margin, y, contentW, 11, [14, 30, 70]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL', margin + 4, y + 7.5);
  doc.setTextColor(212, 175, 55);
  rightText(formatMWK(TOTAL_FEE), pageW - margin - 50, y + 7.5, 10, 'bold', [212, 175, 55]);
  y += 11;

  // ── OFFICIAL NOTE ─────────────────────────────────────────────
  y += 10;
  drawRect(margin, y, contentW, 22, [248, 249, 250]);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 22, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bolditalic');
  doc.setTextColor(60, 60, 60);
  doc.text('Official Note', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  const note = `This certificate confirms that ${user.fullname || 'the above student'} has fulfilled all financial obligations ` +
    `for the academic year 2025/2026 and is duly cleared to sit examinations and participate in all academic activities.`;
  const noteLines = doc.splitTextToSize(note, contentW - 10);
  doc.text(noteLines, margin + 5, y + 13);
  y += 22;

  // ── SIGNATURE AREA ────────────────────────────────────────────
  y += 14;
  drawLine(y, [100, 100, 100], 0.5);
  y += 5;
  leftText('Registrar / Accounts Office',  margin,            y, 9, 'normal', [80, 80, 80]);
  rightText(`Date: ${docDate}`,            pageW - margin,    y, 9, 'normal', [80, 80, 80]);

  // ── FOOTER ────────────────────────────────────────────────────
  doc.setFillColor(14, 30, 70);
  doc.rect(0, pageH - 16, pageW, 16, 'F');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('This is a computer-generated document. No signature is required.',  pageW / 2, pageH - 9,  { align: 'center' });
  doc.text('Don Bosco College — Academic Affairs Portal',                        pageW / 2, pageH - 4,  { align: 'center' });

  // ── SAVE ──────────────────────────────────────────────────────
  doc.save(`Clearance_${user.student_reg || 'student'}_${now.getFullYear()}.pdf`);
}


const myFeesCon = document.getElementById('myFeesCon');
const schoolkey  = localStorage.getItem('schoolKey');

// ── Hardcoded fee structure (update as needed) ────────────────
const FEE_STRUCTURE = [
  { label: 'Tuition Fee',           amount: 450000 },
  { label: 'Registration Fee',      amount: 15000  },
  { label: 'Library & Resources',   amount: 10000  },
  { label: 'ICT / Lab Fee',         amount: 12000  },
  { label: 'Student Union Levy',    amount: 5000   },
  { label: 'Examination Fee',       amount: 8000   },
];

const TOTAL_FEE = FEE_STRUCTURE.reduce((a, b) => a + b.amount, 0);

function formatMWK(n) {
  return 'MWK ' + n.toLocaleString('en-MW');
}

function spinner() {
  return `<div class="main-spinner text-center" style="padding:60px 0;">
    <div class="spinner-border" role="status"></div>
    <p class="mt-2" style="color:var(--muted);font-size:13px;">Loading fees…</p>
  </div>`;
}

async function MyFees() {
  try {
    // ── Load jsPDF if not already loaded ─────────────────────
    if (!window.jspdf) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    myFeesCon.innerHTML = spinner();
    if (!schoolkey) { window.location.href = '/'; return; }

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${schoolkey}` };

    const [userRes, feesRes] = await Promise.all([
      fetch('/auth/user-details', { headers }),
      fetch('/student/check-fees', { headers })
    ]);

    const [userData, feesData] = await Promise.all([userRes.json(), feesRes.json()]);

    if (userData.msg) { localStorage.removeItem('schoolKey'); window.location.href = '/'; return; }
    if (userData?.user?.role !== 'student') { window.location.href = '/'; return; }

    const user = userData.user;
    const fees = feesData.mystat;  // null | { status: 'paid' | 'pending', createdAt }

    const isPaid    = fees?.status === 'paid';
    const isPending = fees?.status === 'pending';
    const isUnpaid  = !fees;

    const balance   = isPaid ? 0 : TOTAL_FEE;

    const statusColor  = isPaid ? '#16a34a' : isPending ? '#d97706' : '#dc2626';
    const statusBg     = isPaid ? '#dcfce7' : isPending ? '#fef9c3' : '#fee2e2';
    const statusBorder = isPaid ? '#86efac' : isPending ? '#fde047' : '#fca5a5';
    const statusLabel  = isPaid ? 'Cleared' : isPending ? 'Pending' : 'Unpaid';
    const statusIcon   = isPaid ? 'ti-circle-check-filled' : isPending ? 'ti-clock' : 'ti-alert-circle';

    myFeesCon.innerHTML = `
      <div class="page-header">
        <h1>Fees & Clearance</h1>
        <p>Your fee account for the current academic year.</p>
      </div>

      <!-- Status + Balance top row -->
      <div class="stats-row" style="margin-bottom:24px;">

        <div class="stat-card" style="border-color:${statusBorder};background:${statusBg};">
          <div class="stat-card-top">
            <div class="stat-card-icon" style="background:rgba(0,0,0,0.06);color:${statusColor};">
              <i class="ti ${statusIcon}"></i>
            </div>
          </div>
          <div class="stat-card-num" style="font-size:20px;color:${statusColor};">${statusLabel}</div>
          <div class="stat-card-label">Clearance Status</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <div class="stat-card-icon gold"><i class="ti ti-receipt"></i></div>
          </div>
          <div class="stat-card-num" style="font-size:16px;">${formatMWK(TOTAL_FEE)}</div>
          <div class="stat-card-label">Total Fees Due</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <div class="stat-card-icon ${isPaid ? 'green' : 'red'}">
              <i class="ti ti-cash"></i>
            </div>
          </div>
          <div class="stat-card-num" style="font-size:16px;color:${isPaid ? '#16a34a' : '#dc2626'};">
            ${formatMWK(balance)}
          </div>
          <div class="stat-card-label">Outstanding Balance</div>
        </div>

      </div>

      <!-- Two-column layout -->
      <div class="row g-4">

        <!-- Left: breakdown -->
        <div class="col-lg-7">
          <div class="content-box">
            <div class="content-box-header">
              <div class="content-box-title"><i class="ti ti-list me-2"></i>Fee Breakdown</div>
              <span style="font-size:12px;color:var(--muted);">Academic Year 2025/26</span>
            </div>
            <div class="content-box-body" style="padding:0;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="background:var(--cream);border-bottom:1px solid var(--border);">
                    <th style="padding:12px 22px;text-align:left;font-size:12px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Description</th>
                    <th style="padding:12px 22px;text-align:right;font-size:12px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Amount</th>
                    <th style="padding:12px 22px;text-align:center;font-size:12px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${FEE_STRUCTURE.map((item, i) => `
                    <tr style="border-bottom:1px solid var(--border);${i % 2 === 0 ? '' : 'background:var(--cream);'}">
                      <td style="padding:14px 22px;font-size:13.5px;color:var(--navy);">${item.label}</td>
                      <td style="padding:14px 22px;text-align:right;font-size:13.5px;font-family:var(--mono);color:var(--navy);">
                        ${formatMWK(item.amount)}
                      </td>
                      <td style="padding:14px 22px;text-align:center;">
                        ${isPaid
                          ? `<span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;">Paid</span>`
                          : `<span style="background:#fee2e2;color:#dc2626;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;">Unpaid</span>`
                        }
                      </td>
                    </tr>`).join('')}
                </tbody>
                <tfoot>
                  <tr style="background:var(--navy);">
                    <td style="padding:16px 22px;font-weight:700;color:#fff;font-size:14px;">Total</td>
                    <td style="padding:16px 22px;text-align:right;font-weight:700;color:var(--gold);font-size:14px;font-family:var(--mono);">
                      ${formatMWK(TOTAL_FEE)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: action card -->
        <div class="col-lg-5">
          <div class="content-box" style="position:sticky;top:72px;">
            <div class="content-box-header">
              <div class="content-box-title"><i class="ti ti-shield-check me-2"></i>Clearance Certificate</div>
            </div>
            <div class="content-box-body" style="text-align:center;padding:28px;">

              <!-- Clearance badge -->
              <div style="width:80px;height:80px;border-radius:50%;margin:0 auto 16px;
                          background:${statusBg};border:3px solid ${statusBorder};
                          display:flex;align-items:center;justify-content:center;font-size:34px;color:${statusColor};">
                <i class="ti ${statusIcon}"></i>
              </div>

              <div style="font-size:17px;font-weight:700;color:${statusColor};margin-bottom:8px;">${statusLabel}</div>

              <div style="font-size:13px;color:var(--muted);margin-bottom:24px;line-height:1.6;">
                ${isPaid
                  ? 'Your fees are fully settled. You are cleared for examinations and academic activities.'
                  : isPending
                  ? 'Your payment is under review. Contact the accounts office if this persists.'
                  : 'You have an outstanding balance. Pay your fees to obtain clearance.'
                }
              </div>

              <!-- Student info -->
              <div style="background:var(--cream);border-radius:10px;padding:16px;text-align:left;margin-bottom:20px;border:1px solid var(--border);">
                <div style="font-size:12px;color:var(--muted);margin-bottom:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Student Details</div>
                <div style="font-size:13px;margin-bottom:6px;"><span style="color:var(--muted);">Name:</span> <strong>${user.fullname}</strong></div>
                <div style="font-size:13px;margin-bottom:6px;"><span style="color:var(--muted);">Reg No:</span> <strong style="font-family:var(--mono);">${user.student_reg || 'N/A'}</strong></div>
                <div style="font-size:13px;"><span style="color:var(--muted);">Programme:</span> <strong>${user.program || 'N/A'}</strong></div>
              </div>

              ${isPaid
                ? `<button id="downloadBtn" class="portal-btn" style="width:100%;justify-content:center;gap:8px;">
  <i class="ti ti-file-download"></i> Download Clearance PDF
</button>`
                : `<button id="payBtn" class="portal-btn" style="width:100%;justify-content:center;
                            background:${isPending ? 'var(--muted)' : 'var(--gold)'};
                            ${isPending ? 'cursor:not-allowed;opacity:.7;' : ''}">
                     <i class="ti ti-cash"></i>
                     ${isPending ? 'Payment Under Review' : 'Pay Fees Now'}
                   </button>`
              }

              ${fees?.createdAt ? `
              <div style="margin-top:12px;font-size:11.5px;color:var(--muted-light);">
                Last updated: ${new Date(fees.createdAt).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}
              </div>` : ''}

            </div>
          </div>
        </div>

      </div>`;

      const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn && isPaid) {
  downloadBtn.addEventListener('click', () => generateClearancePDF(user, fees));
}

    // ── Pay button handler ────────────────────────────────────
    const payBtn = document.getElementById('payBtn');
    if (payBtn && isUnpaid) {
      payBtn.addEventListener('click', async () => {
        payBtn.disabled = true;
        payBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Processing…`;

        try {
          const res  = await fetch('/student/pay-fees', { method:'POST', headers });
          const data = await res.json();

          if (data.msg) {
            payBtn.disabled = false;
            payBtn.innerHTML = `<i class="ti ti-cash"></i> Pay Fees Now`;
            alert(data.msg);
            return;
          }

          if (data.message) {
            payBtn.innerHTML = `<i class="ti ti-circle-check-filled"></i> Fees Submitted`;
            payBtn.style.background = '#16a34a';
            setTimeout(() => window.location.reload(), 1000);
          }

        } catch (err) {
          payBtn.disabled = false;
          payBtn.innerHTML = `<i class="ti ti-cash"></i> Pay Fees Now`;
        }
      });
    }

  } catch (err) {
    myFeesCon.innerHTML = `<p class="text-center text-danger">Failed to load fees page. Please refresh.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', MyFees);