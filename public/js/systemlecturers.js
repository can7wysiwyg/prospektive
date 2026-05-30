const viewLecsCon = document.getElementById('viewLecsCon')

const schoolkey = localStorage.getItem('schoolKey') 


async function ViewLecturers() {
    try {

        viewLecsCon.innerHTML = `
        
          <div class="hero__ctas__cats d-flex justify-content-center align-items-center" style="min-height: 180px;">
    <div class="loading-spinner text-center main-spinner">
        <div class="spinner-border ls-text" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading Page...</p>
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
        return viewLecsCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "admin") {

        const reqLec = await fetch('/admin/view-lecturers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${schoolkey}`
            }
        }) 

        const resLec = await reqLec.json()

       
       viewLecsCon.innerHTML = `
<div class="container py-4">
  <div class="row g-4">

    <!-- ADD LECTURER -->
    <div class="col-lg-4">
      <div class="card shadow-sm border-0 h-100">
        <div class="card-header">
          <div class="mb-0" id="statusMessage">
            <i class="ti ti-user-plus me-2"></i>
            Add Lecturer
          </div>
        </div>
        <div class="card-body">
        <div class="clearForm">
          <form id="cForm" >
            <div class="mb-3">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-control" id="fullname" placeholder="Enter full name" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" id="email" placeholder="Enter email" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Phone</label>
              <input type="text" class="form-control" id="phone" placeholder="Enter phone">
            </div>

             <div style="margin-bottom:24px;">
              <label style="display:block; margin-bottom:8px; font-weight:600;">Lecturer Gender <span style="color:red;">*</span></label>
              <select id="gender" required style="width:100%; padding:14px; border:1px solid #ddd; border-radius:8px;">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>


              </select>
            </div>


            
            <button type="submit" class="btn btn-primary w-100" id="submitBtn">
              <i class="ti ti-plus me-1"></i> Add Lecturer
            </button>
          </form>
          </div>
        </div>
      </div>
    </div>

    <!-- LECTURERS LIST -->
    <div class="col-lg-8">
      <div class="card shadow-sm border-0 h-100">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="ti ti-users me-2"></i>
            Lecturers
          </h5>
          <span class="badge bg-primary">
            ${resLec?.lecturers?.length || 0}
          </span>
        </div>

        <div class="card-body">
          ${resLec?.msg ? `
            <p class="text-center text-success fw-bold py-4">${resLec.msg}</p>
          ` : resLec?.lecturers?.length ? `
            <div class="row g-3">
              ${resLec.lecturers.map(item => `
                <div class="col-md-6">
                  <div class="card border h-100">
                    <div class="card-body">
                      <div class="d-flex align-items-center mb-3">
                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                             style="width:50px;height:50px;">
                          <i class="ti ti-user"></i>
                        </div>
                        <div class="ms-3">
                          <h6 class="mb-1">${item.fullname}</h6>
                          <small class="text-muted">Lecturer</small>
                        </div>
                      </div>

                      <p class="mb-2">
                        <i class="ti ti-mail me-2"></i>${item.email}
                      </p>
                      <p class="mb-3">
                        <i class="ti ti-phone me-2"></i>${item.phone || 'N/A'}
                      </p>

                      <button data-id="${item._id}" 
                              class="btn btn-outline-danger btn-sm my-delete w-100">
                        <i class="ti ti-settings me-1"></i> Manage Lecturer
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="text-center text-muted py-5">
              No lecturers found.
            </div>
          `}
        </div>
      </div>
    </div>

  </div>
</div>
`;


document.getElementById('cForm').addEventListener('submit', async(e) => {
        e.preventDefault() 
                     const statusMessage = document.getElementById('statusMessage')
                      const submitBtn = document.getElementById('submitBtn')

          submitBtn.disabled = true 
          submitBtn.textContent = "Submitting" 

       
        try {
            const fullname = document.getElementById('fullname').value 
            const email = document.getElementById('email').value 
            const phone = document.getElementById('phone').value 
            const gender = document.getElementById('gender').value 
            

            
           
        const Cacc = await fetch('/admin/create-lecturer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${schoolkey}`
            },
            body: JSON.stringify({fullname, email, phone, gender})
        })
            

        resAcc = await Cacc.json() 

        if(resAcc.msg) {
                      submitBtn.disabled = false
                    submitBtn.textContent = "Submit" 

            return statusMessage.innerHTML = `
                    <span>${resAcc.msg} </span>
                    
                    `

        } else if(resAcc.message) {
           
                  
                  const lec_details = resAcc?.lec_details

                 return statusMessage.innerHTML = `
                 <div class="text-center text-danger">
                       <p>name: ${lec_details.name} </p>
                      <p>email: ${lec_details.email} </p>
                      <p>password: ${lec_details.pass} </p>


                 </div>
                 
                 `
                 }
            
                    
                 } catch (error) {
                    console.log(error)
                    
                    return 
                    
                 }


       })




//end here
    }


} catch(error) {

    return viewLecsCon.innerHTML = `
    <p class="text-center">Failed to load page </p>
    `
}


}


document.addEventListener('DOMContentLoaded', ViewLecturers)