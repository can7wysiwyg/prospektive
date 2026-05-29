const adminCon = document.getElementById('adminCon')
const schoolkey = localStorage.getItem('schoolKey') 

async function LoadDash() {
    try {

        adminCon.innerHTML = `
                <div class="hero__ctas__cats d-flex justify-content-center align-items-center" style="min-height: 180px;">
    <div class="loading-spinner text-center main-spinner">
        <div class="spinner-border ls-text" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading Administrator...</p>
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

        return adminCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "admin") {

         return adminCon.innerHTML = `
         
         <div class="container py-5">

  <div class="row g-4">

    <!-- ADD USERS -->
    <div class="col-md-4">
      <div class="dashboard-card">

        <div class="card-icon">
          <i class="fa-solid fa-users"></i>
        </div>

        <h4>Add Users</h4>

        <p>
          Manage and register new system users into the platform.
        </p>

        <a href="/adduser" class="dashboard-btn">
          Add Users
        </a>

      </div>
    </div>

    <!--  LECTURERS -->
    <div class="col-md-4">
      <div class="dashboard-card">

        <div class="card-icon">
          <i class="fa-solid fa-chalkboard-user"></i>
        </div>

        <h4>Lecturers</h4>

        <p>
          View lecturers  and manage department staff.
        </p>

        <a href="/systemlecturers" class="dashboard-btn">
          View 
        </a>

      </div>
    </div>

    <!--  STUDENTS -->
    <div class="col-md-4">
      <div class="dashboard-card">

        <div class="card-icon">
          <i class="fa-solid fa-user-graduate"></i>
        </div>

        <h4> Students</h4>

        <p>
          Manage students information easily.
        </p>

        <a href="/systemstudents" class="dashboard-btn">
          View Students
        </a>

      </div>
    </div>

  </div>

</div>
         
         
         `

    }

        
    } catch (error) {
      console.log(error)
        return adminCon.innerHTML = `
        <p class="text-center">Failed to load dashboard </p>
        `
    }

}

document.addEventListener('DOMContentLoaded', LoadDash)