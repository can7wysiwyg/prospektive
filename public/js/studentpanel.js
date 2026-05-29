const stuPanelCon = document.getElementById('stuPanelCon')
const schoolkey = localStorage.getItem('schoolKey') 

async function StudentPanel() {
    try {
        stuPanelCon.innerHTML = `
                <div class="hero__ctas__cats d-flex justify-content-center align-items-center" style="min-height: 180px;">
    <div class="loading-spinner text-center main-spinner">
        <div class="spinner-border ls-text" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading Student...</p>
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


    if(data?.user?.role === "student") {
       
        stuPanelCon.innerHTML = `


<div class="container student-panel">

  <!-- WELCOME -->
  <div class="welcome-box">

    <h2>
      Welcome, <span class="text-danger">${data.user.fullname}</span>
    </h2>

    <p>
      Access your profile, check grades, and monitor fees status from your student dashboard.
    </p>

  </div>

  <!-- CARDS -->
  <div class="row g-4">

    <!-- PROFILE -->
    <div class="col-md-4">

      <div class="panel-card">

        <div class="panel-icon">
          <i class="ti ti-user"></i>
        </div>

        <h4>Profile</h4>

        <p>
          View your personal information and academic details.
        </p>

        <a href="/myprofile" class="panel-btn">
          <i class="ti ti-arrow-right"></i>
          Open Profile
        </a>

      </div>

    </div>

    <!-- GRADES -->
    <div class="col-md-4">

      <div class="panel-card">

        <div class="panel-icon">
          <i class="ti ti-clipboard-data"></i>
        </div>

        <h4>Grades</h4>

        <p>
          View grades and academic performance for all modules.
        </p>

        <a href="/viewgrades" class="panel-btn">
          <i class="ti ti-arrow-right"></i>
          View Grades
        </a>

      </div>

    </div>

    <!-- FEES -->
    <div class="col-md-4">

      <div class="panel-card">

        <div class="panel-icon">
          <i class="ti ti-cash"></i>
        </div>

        <h4>Fees</h4>

        <p>
          Monitor fee payments and financial account status.
        </p>

        <a href="/myfees" class="panel-btn">
          <i class="ti ti-arrow-right"></i>
          View Fees
        </a>

      </div>

    </div>

  </div>

</div>

`;

    }



    } catch (error) {
        return stuPanelCon.innerHTML = `
        <p class="text-center">Failed to load the page </p>
        `
    }
}

document.addEventListener('DOMContentLoaded', StudentPanel)