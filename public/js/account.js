const accouCon = document.getElementById('accouCon')
     const schoolKey = localStorage.getItem('schoolKey')


async function Login() {
    try {

        if(schoolKey) {
            window.location.href = "/"
            return;
        }

        accouCon.innerHTML = `
        <div class="form-center">
          <div class="signin-container">

    <div class="logo">
      DB
    </div>

    <h1 class="title">Welcome Back</h1>
    <p class="subtitle">
      Sign in to continue
    </p>

    <form id="logForm">

      <div class="form-group">
        <label>Email Address</label>
        <input 
          type="email" 
          class="form-control"
          id="email"
          placeholder="Enter your email"
          required
        />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input 
          type="password" 
          id="password"
          class="form-control"
          placeholder="Enter your password"
          required
        />
      </div>

      <div class="form-options">

        
        <a href="/forgot" class="forgot">
          Forgot Password?
        </a>

      </div>

      <button class="signin-btn sgnBtn" type="submit">
        Sign In
      </button>

    </form>

    <div class="bottom-text">
          </div>

  </div>


        </div>
        
        
        `


        document.getElementById('logForm').addEventListener('submit', async(e) => {
            e.preventDefault();
            const sgnBtn = document.querySelector('.sgnBtn')
            const subtitle = document.querySelector('.subtitle')
            const original = sgnBtn.textContent
            sgnBtn.disabled = true
            sgnBtn.textContent = "Signing You In..."

            try {
                const email = document.getElementById('email').value.trim()
                const password = document.getElementById('password').value 

                if(!email || !password) {
                    sgnBtn.disabled = false
                sgnBtn.textContent = original

                return subtitle.innerHTML = `
                <span class="text-danger">email and password are required </span>
                `
                }


                const request = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({email, password})
                })

                const response = await request.json()

                 if(response?.msg) {
                   sgnBtn.disabled = false
                sgnBtn.textContent = original

                return subtitle.innerHTML = `
                <span class="text-danger">${response.msg} </span>
                ` 
                 } else if(response?.schoolKey) {
                    localStorage.setItem('schoolKey', response?.schoolKey)
                    window.location.href = "/"
                 }




                
            } catch (error) {
                sgnBtn.disabled = false
                sgnBtn.textContent = original

                return subtitle.innerHTML = `
                <span class="text-danger">Failed to sign you in </span>
                `
 
                
            }



        })
        
    } catch (error) {
        return accouCon.innerHTML = `
        <p class="text-center"> there was a problem loading this page </p>
        `
    }
}

document.addEventListener('DOMContentLoaded', Login)