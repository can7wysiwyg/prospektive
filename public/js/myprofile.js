const uProfCon = document.getElementById('uProfCon')
const schoolkey = localStorage.getItem('schoolKey') 


async function MyProfile() {
    try {
        uProfCon.innerHTML = `
                <div class="hero__ctas__cats d-flex justify-content-center align-items-center" style="min-height: 180px;">
    <div class="loading-spinner text-center main-spinner">
        <div class="spinner-border ls-text" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading Student Profile...</p>
    </div>
</div> 

        
        `

        if(!schoolkey) {
            window.location.href = "/"
            return;
        }

         const response = await fetch(`/auth/user-details`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${schoolkey}`
        }
    })

 
    const data = await response.json();
   
    if(data.msg) {
                localStorage.removeItem('schoolKey')

        return uProfCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "student") {

       const reqStud = await fetch('/student/get-student', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${schoolkey}`
        }

       })

       const resStud = await reqStud.json()

       if(resStud.msg) {
             return uProfCon.innerHTML = `
        <p class="text-danger text-center">${resStud.msg} </p>
        `

       }

       const student = resStud.student;

uProfCon.innerHTML = `


<div class="container profile-wrapper">

  <div class="row justify-content-center">

    <div class="col-md-6">

      <div class="profile-card">

        <div class="avatar">
          <i class="ti ti-user"></i>
        </div>

        <h3 class="profile-title">
          My Profile
        </h3>

        <form>

          <!-- FULLNAME -->
          <div class="mb-3">
            <label class="form-label">Full Name</label>
            <input 
              type="text"
              class="form-control"
              value="${student.fullname}"
              disabled
            />
          </div>

          <!-- EMAIL -->
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input 
              type="email"
              class="form-control"
              value="${student.email}"
              disabled
            />
          </div>

          <!-- PHONE -->
          <div class="mb-3">
            <label class="form-label">Phone</label>
            <input 
              type="text"
              class="form-control"
              value="${student.phone}"
              disabled
            />
          </div>

          <!-- PASSWORD -->
          <div class="mb-4">
            <label class="form-label">Password</label>
            <input 
              type="password"
              class="form-control"
              value="************"
              disabled
            />
          </div>

          <!-- UPDATE BUTTON -->
          <button 
            type="button"
            class="update-btn"
            disabled
          >
            Update Profile
          </button>

        </form>

      </div>

    </div>

  </div>

</div>

`;

    }
        
    } catch (error) {
        return uProfCon.innerHTML = `
        <p class="text-center">Failed to load profile </p>
        `
    }
}


document.addEventListener('DOMContentLoaded', MyProfile)