
const navmenu = document.getElementById('navmenu');
const schoolKey = localStorage.getItem('schoolKey');

const PAGE_TITLES = {
  '/':               { label: 'Home',             icon: 'ti-home-2' },
  '/studentpanel':   { label: 'My Dashboard',      icon: 'ti-layout-dashboard' },
  '/myprofile':      { label: 'My Profile',         icon: 'ti-user' },
  '/viewgrades':     { label: 'My Grades',          icon: 'ti-clipboard-data' },
  '/myfees':         { label: 'My Fees',            icon: 'ti-cash' },
  '/admindash':      { label: 'Admin Dashboard',    icon: 'ti-shield-check' },
  '/addmethod':      { label: 'Add Students',       icon: 'ti-users-plus' },
  '/adduser':        { label: 'Add User',           icon: 'ti-user-plus' },
  '/importstu':      { label: 'Import Students',    icon: 'ti-file-import' },
  '/systemlecturers':{ label: 'Lecturers',          icon: 'ti-chalkboard' },
  '/systemstudents': { label: 'Students',           icon: 'ti-id' },
  '/progsstudents':  { label: 'Programs',           icon: 'ti-certificate' },
  '/lecturertasks':  { label: 'My Tasks',           icon: 'ti-layout-dashboard' },
  '/sendgrades':     { label: 'Send Grades',      icon: 'ti-report-analytics' },
  '/account':        { label: 'Sign In',            icon: 'ti-login' },
};

const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
const currentPage = PAGE_TITLES[currentPath] || { label: 'Portal', icon: 'ti-home-2' };

function buildStudentNav(active) {
  return `
    <div class="sidebar-section">
      <div class="sidebar-section-label">Student</div>
      ${navLink('/studentpanel','ti-layout-dashboard','Dashboard', active)}
      ${navLink('/myprofile','ti-user','My Profile', active)}
      ${navLink('/viewgrades','ti-clipboard-data','My Grades', active)}
      ${navLink('/myfees','ti-cash','Fees & Payments', active)}
    </div>`;
}

function buildAdminNav(active) {
  return `
    <div class="sidebar-section">
      <div class="sidebar-section-label">Administration</div>
      ${navLink('/admindash','ti-layout-dashboard','Dashboard', active)}
      ${navLink('/addmethod','ti-users-plus','Add Students', active)}
      ${navLink('/systemlecturers','ti-chalkboard','Add Lecturers', active)}
      ${navLink('/systemstudents','ti-id','Students', active)}
      ${navLink('/progsstudents','ti-certificate','Programs', active)}
    </div>`;
}

function buildLecturerNav(active) {
  return `
    <div class="sidebar-section">
      <div class="sidebar-section-label">Lecturer</div>
      ${navLink('/lecturertasks','ti-layout-dashboard','My Tasks', active)}
      ${navLink('/sendgrades','ti-report-analytics','Send Grades', active)}
    </div>`;
}

function buildPublicNav() {
  return `
    <div class="sidebar-section">
      <div class="sidebar-section-label">Portal</div>
      ${navLink('/','ti-home-2','Home', currentPath)}
      ${navLink('/account','ti-login','Sign In', currentPath)}
    </div>`;
}

function navLink(href, icon, label, active) {
  const isActive = (active === href || (href !== '/' && active.startsWith(href))) ? 'active' : '';
  return `<a href="${href}" class="sidebar-link ${isActive}">
    <i class="ti ${icon}"></i>
    <span>${label}</span>
  </a>`;
}

async function LoadMenu() {
  try {
    let roleNav = buildPublicNav();
    let userBlock = '';
    let userData = null;

    if (schoolKey) {
      try {
        const res = await fetch('/auth/user-details', {
          headers: { 'Authorization': `Bearer ${schoolKey}`, 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (!data.msg && data.user) {
          userData = data.user;
          const role = userData.role;
          const active = currentPath;

          if (role === 'student') roleNav = buildStudentNav(active);
          else if (role === 'admin') roleNav = buildAdminNav(active);
          else if (role === 'lecturer') roleNav = buildLecturerNav(active);

          const initials = (userData.fullname || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
          userBlock = `
            <div class="sidebar-footer">
              <div class="sidebar-user">
                <div class="sidebar-user-avatar">${initials}</div>
                <div style="flex:1;min-width:0;">
                  <div class="sidebar-user-name">${userData.fullname || 'User'}</div>
                  <div class="sidebar-user-role">${role || ''}</div>
                </div>
                <a href="#" id="logoutbtn" title="Sign out" style="color:rgba(255,255,255,0.4);font-size:17px;text-decoration:none;flex-shrink:0;">
                  <i class="ti ti-logout"></i>
                </a>
              </div>
            </div>`;
        }
      } catch(e) {  }

      
      setInterval(() => {
        fetch(`/auth/check-session?userKey=${schoolKey}`).catch(() => {});
      }, 60000);
    }

    if (!userBlock) {
      userBlock = `
        <div class="sidebar-footer">
          <a href="/account" class="sidebar-link" style="justify-content:center;background:rgba(224,168,32,0.12);color:var(--gold);font-weight:600;">
            <i class="ti ti-login"></i><span>Sign In</span>
          </a>
        </div>`;
    }

    navmenu.innerHTML = `
      <div class="app-shell">
        <aside class="app-sidebar" id="appSidebar">
          <a href="/" class="sidebar-brand">
            <div class="sidebar-crest">DB</div>
            <div class="sidebar-brand-text">
              <div class="sidebar-brand-name">Don Bosco</div>
              <div class="sidebar-brand-sub">Student Portal</div>
            </div>
          </a>
          <nav class="sidebar-nav">
            ${roleNav}
          </nav>
          ${userBlock}
        </aside>

        <div class="app-main" id="appMain">
          <div class="app-topbar">
            <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle menu">
              <i class="ti ti-menu-2"></i>
            </button>
            <div class="topbar-title topbar-breadcrumb">
              <span>${currentPage.label}</span>
            </div>
            <div class="topbar-actions">
              <div class="topbar-badge" title="Notifications"><i class="ti ti-bell"></i></div>
            </div>
          </div>
          <div class="page-content" id="pageContent">
    `;

    // Move the rest of the body's children (except navmenu) into pageContent
    const pageContent = document.getElementById('pageContent');
    const appMain = document.getElementById('appMain');
    document.querySelectorAll('body > *:not(#navmenu):not(script)').forEach(el => {
      pageContent.appendChild(el);
    });

    // Close the shell
    const closer = document.createElement('div');
    closer.innerHTML = `</div></div></div>`;
    appMain.appendChild(closer);

    // Mobile sidebar toggle
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('appSidebar');

    if (toggle && sidebar) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        let overlay = document.getElementById('sidebarOverlay');
        if (sidebar.classList.contains('open')) {
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', () => {
              sidebar.classList.remove('open');
              overlay.remove();
            });
          }
        } else if (overlay) {
          overlay.remove();
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutbtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await fetch('/auth/logout-user', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${schoolKey}` }
          });
        } catch(e) {}
        localStorage.removeItem('schoolKey');
        window.location.href = '/';
      });
    }

  } catch(err) {
    navmenu.innerHTML = `<p class="text-center p-4 text-danger">Failed to load navigation</p>`;
  }
}

document.addEventListener('DOMContentLoaded', LoadMenu);
