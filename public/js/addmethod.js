const addCon = document.getElementById('addCon')
const schoolkey = localStorage.getItem('schoolKey') 

async function AddMethod() {
    try {
        addCon.innerHTML = `
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

        return addCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "admin") {

                addCon.innerHTML = `
                
                <div class="container py-5">

  <div class="row justify-content-center">

    <div class="col-md-6">

      <div class="card shadow-sm border-0">
        
        <div class="card-header text-center">
          <h5 class="mb-0">Student Management</h5>
        </div>

        <div class="list-group list-group-flush">

          <a href="/importstu"
             class="list-group-item list-group-item-action d-flex align-items-center gap-2">
            <i class="ti ti-file-spreadsheet"></i>
            Import Students From Excel Spreadsheet
          </a>

          <a href="/adduser"
             class="list-group-item list-group-item-action d-flex align-items-center gap-2">
            <i class="ti ti-user-plus"></i>
            Manually Add Student
          </a>

        </div>

      </div>

    </div>

  </div>

</div>
                
                `

    }

        
    } catch (error) {

        return addCon.innerHTML = `
        <p class="text-center">Failed to load page </p>
        `
        
    }
}

document.addEventListener('DOMContentLoaded', AddMethod)
