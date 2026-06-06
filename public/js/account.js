const accouCon = document.getElementById('accouCon');
const schoolKey = localStorage.getItem('schoolKey');

async function Login() {
  try {
    if (schoolKey) {
      window.location.href = '/';
      return;
    }

    accouCon.innerHTML = `
      <div class="signin-container">
        <div class="signin-logo">DB</div>
        <h1>Welcome Back</h1>
        <p class="subtitle">Sign in to your portal account</p>

        <form id="logForm">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" id="email" placeholder="you@school.ac.mw" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" id="password" placeholder="Enter your password" required />
          </div>

          <div class="form-options">
            <label class="remember">
              <input type="checkbox" /> Remember me
            </label>
            <a href="/forgot" class="forgot">Forgot password?</a>
          </div>

          <button class="signin-btn sgnBtn" type="submit">Sign In</button>
        </form>

        <div class="bottom-text" id="signInStatus"></div>
      </div>
    `;

    document.getElementById('logForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const sgnBtn = document.querySelector('.sgnBtn');
      const status = document.getElementById('signInStatus');
      sgnBtn.disabled = true;
      sgnBtn.textContent = 'Signing in…';

      try {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
          sgnBtn.disabled = false;
          sgnBtn.textContent = 'Sign In';
          status.innerHTML = `<span class="text-danger">Email and password are required.</span>`;
          return;
        }

        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data?.msg) {
          sgnBtn.disabled = false;
          sgnBtn.textContent = 'Sign In';
          status.innerHTML = `<span class="text-danger">${data.msg}</span>`;
        } else if (data?.schoolKey) {
          localStorage.setItem('schoolKey', data.schoolKey);
          window.location.href = '/';
        }
      } catch (err) {
        sgnBtn.disabled = false;
        sgnBtn.textContent = 'Sign In';
        document.getElementById('signInStatus').innerHTML =
          `<span class="text-danger">Could not connect. Please try again.</span>`;
      }
    });

  } catch (err) {
    accouCon.innerHTML = `<p class="text-center text-danger">Failed to load sign-in page.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', Login);
