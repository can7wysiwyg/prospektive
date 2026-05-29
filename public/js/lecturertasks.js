const lecTaskCon = document.getElementById('lecTaskCon')
const schoolkey = localStorage.getItem('schoolKey') 


async function Lecturer() {
    try {
        lecTaskCon.innerHTML = `
                <div class="hero__ctas__cats d-flex justify-content-center align-items-center" style="min-height: 180px;">
    <div class="loading-spinner text-center main-spinner">
        <div class="spinner-border ls-text" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading Lecturer...</p>
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

        return lecTaskCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "lecturer") {

        lecTaskCon.innerHTML = `
                <div class="container py-5">

  <div class="row justify-content-center">

    <div class="col-md-5">

      <div class="dashboard-card">

        <div class="card-icon">
          <i class="ti ti-report-analytics"></i>
        </div>

        <h3>Send Grades To Students</h3>

        <p>
          Upload and manage student grades for all assigned courses.
        </p>

        <a href="/sendgrades" class="dashboard-btn">
          Send Grades
        </a>

      </div>

    </div>

  </div>

</div>
                   
        
        `

    }



        
    } catch (error) {
        return lecTaskCon.innerHTML = `
        <p class="text-center">Failed to load page </p>
        `
    }
}


document.addEventListener('DOMContentLoaded', Lecturer)