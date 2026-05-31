const progStuCon = document.getElementById('progStuCon')
const schoolkey = localStorage.getItem('schoolKey') 

async function ProgsStus() {
    try {
        progStuCon.innerHTML = `
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

        return progStuCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "admin") {
        const reqProgs = await fetch('/show-programs')
         const resProgs = await reqProgs.json() 

         if(resProgs.msg) {
          return progStuCon.innerHTML = `
          <p class="text-center">${resProgs.msg}</p>
          `
         }
          const programs = resProgs?.programs
         progStuCon.innerHTML = `

      <div class="col-lg-12">
  <div class="card shadow-sm border-0 h-100">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">
        <i class="ti ti-chalkboard me-2"></i> Programs
      </h5>
      <span class="badge bg-primary rounded-pill">${programs?.length || 0}</span>
    </div>

    <div class="card-body">
      <div class="row g-3">
        ${programs.map(item => `
          <div class="col-sm-6 col-lg-3">
            <div class="card border h-100">
              <div class="card-body d-flex flex-column gap-3">

                <div class="rounded-2 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                     style="width:44px;height:44px;">
                  <i class="ti ti-chalkboard text-primary fs-5"></i>
                </div>

                <div>
                  <h6 class="mb-1 fw-semibold">${item.prog_name}</h6>
                  <code class="text-muted small">${item.prog_id}</code>
                </div>

                <button data-id="${item.prog_id}"
                        class="btn btn-outline-secondary btn-sm mt-auto my-delete w-100">
                  <i class="ti ti-users me-1"></i> View enrolled students
                </button>

              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
</div>
         <!-- overlay -->
         <div id="studentsOverlay" class="overlay-container d-none">

  <div class="overlay-backdrop"></div>

  <div class="overlay-content">

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>
        <i class="ti ti-users"></i>
        Enrolled Students
      </h4>

      <button class="btn btn-danger btn-sm" id="closeOverlay">
        <i class="ti ti-x"></i>
      </button>
    </div>

    <div id="overlayStudentsContent">
      Loading...
    </div>

  </div>

</div>
         
         `


         document.addEventListener('click', async (e) => {

  const btn = e.target.closest('.my-delete');

  if (!btn) return;

  const progId = btn.dataset.id;
  console.log(progId)

  const overlay = document.getElementById('studentsOverlay');
  const content = document.getElementById('overlayStudentsContent');

  overlay.classList.remove('d-none');

  content.innerHTML = `
    <div class="text-center">
      Loading students...
    </div>
  `;

  try {

    const req = await fetch(`/admin/program-students/${progId}`, {
        method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${schoolkey}`
      }
    });

    const res = await req.json();

    

    if (res.msg) {
      content.innerHTML = `
        <p class="text-center text-danger">
          ${res.msg}
        </p>
      `;
      return;
    }

    content.innerHTML = `
      <div class="row g-3">

        ${res.students.map(student => `

          <div class="col-md-6">

            <div class="card border-0 shadow-sm">

              <div class="card-body">

                <h6>
                  <i class="ti ti-user"></i>
                  ${student.fullname}
                </h6>

                <p class="mb-1">
                  ${student.email}
                </p>

                <small class="text-muted">
                  ${student.phone}
                </small>

              </div>

            </div>

          </div>

        `).join('')}

      </div>
    `;

  } catch (err) {
   console.log(err)
    content.innerHTML = `
      <p class="text-danger text-center">
        Failed to load students.
      </p>
    `;
  }

});


    }
    } catch (error) {
        return progStuCon.innerHTML = `
        <p class="text-center">Failed to load page</p>
        `
    }
}

document.addEventListener('click', (e) => {

  if (
    e.target.closest('#closeOverlay') ||
    e.target.classList.contains('overlay-backdrop')
  ) {
    document
      .getElementById('studentsOverlay')
      .classList.add('d-none');
  }

});

document.addEventListener('DOMContentLoaded', ProgsStus)