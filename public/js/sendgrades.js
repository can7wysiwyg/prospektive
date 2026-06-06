const sendGradesCon = document.getElementById('sendGradesCon')
const schoolkey = localStorage.getItem('schoolKey') 


async function SendGrades() {
    try {
        sendGradesCon.innerHTML = `
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

        return sendGradesCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "lecturer") {
         
        const reqStuds = await fetch(`/lecture/course-students`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${schoolkey}`
            }
        })

        const resStuds = await reqStuds.json()

        if(resStuds.msg) {
           return sendGradesCon.innerHTML = `
        <p class="text-danger text-center">${resStuds.msg} </p>
        `

        }

  
         const details = resStuds?.prog_details;
const enrolled = resStuds?.enrolled || [];

sendGradesCon.innerHTML = `
<div class="container py-4">

  <div class="card shadow-sm border-0 mb-4">
  <div class="card-body">

    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">

      <div>
        <h4 class="mb-1" >
          <i class="ti ti-school me-2"></i>
         <span id="modulename"> ${details?.name }</span>
        </h4>

        <p class="text-muted mb-0" >
        <span id="programId">${details?.id }</span>
        </p>
      </div>

      <button
  class="btn btn-primary send-grades-btn"
  data-id="${details?.id}"
  data-bs-toggle="modal"
  data-bs-target="#sendGradesModal"
>
  <i class="ti ti-report me-1"></i>
  Send Grades
</button>
    </div>

  </div>
</div>
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="mb-0">
      <i class="ti ti-users me-2"></i>
      Enrolled Students
    </h5>

    <span class="badge bg-primary">
      ${enrolled.length}
    </span>
  </div>

  ${
    enrolled.length === 0
      ? `
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="ti ti-user-off fs-1 text-muted"></i>
            <h5 class="mt-3">No Students Enrolled</h5>
            <p class="text-muted mb-0">
              There are currently no students enrolled in this program.
            </p>
          </div>
        </div>
      `
      : `
        <div class="row g-3">

          ${enrolled.map(student => `
            <div class="col-md-6 col-lg-4">

              <div
                class="card border-0 shadow-sm h-100 student-card"
                data-id="${student._id}"
                style="cursor:pointer;"
              >

                <div class="card-body">

                  <div class="d-flex align-items-center mb-3">

                    <div
                      class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                      style="width:50px;height:50px;"
                    >
                      <i class="ti ti-user"></i>
                    </div>

                    <div class="ms-3">
                      <h6 class="mb-0">
                        ${student.fullname}
                      </h6>
                    </div>

                  </div>

                  <p class="mb-2">
                    <i class="ti ti-mail me-2"></i>
                    ${student.email}
                  </p>

                  <p class="mb-0">
                    <i class="ti ti-phone me-2"></i>
                    ${student.phone}
                  </p>

                </div>

              </div>

            </div>
          `).join("")}

        </div>
      `
  }

</div>

<div class="modal fade" id="sendGradesModal" tabindex="-1">

  <div class="modal-dialog modal-dialog-centered">

    <div class="modal-content">

      <div class="modal-header">

        <h5 class="modal-title">
          <i class="ti ti-report me-2"></i>
          Import Grades
        </h5>

        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal">
        </button>

      </div>

      <div class="modal-body">

        <input
          type="hidden"
          >

        
        <div class="mb-3">

          <label class="form-label">
            Excel File
          </label>

          <input
            type="file"
            id="gradesFile"
            class="form-control"
            accept=".xlsx,.xls">

        </div>

      </div>

      <div class="modal-footer">

        <button
          type="submit"
          class="btn btn-primary"
          id="importGradesBtn">

          Import Grades

        </button>

      </div>

    </div>

  </div>

</div>

`;


document.addEventListener('click', async (e) => {

  const btn = e.target.closest('#importGradesBtn');

  if (!btn) return;

  const file = document.getElementById('gradesFile').files[0];
  const module_name = document.getElementById('modulename').textContent.trim();
const program = document.getElementById('programId').textContent.trim();
  if (!file || !module_name) {
    alert("Missing data");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("module_name", module_name);
  formData.append("program", program);

  btn.disabled = true;
  btn.innerText = "Uploading...";

  try {

    const res = await fetch("/lecturer/import-grades", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${schoolkey}`
      },
      body: formData
    });

    const data = await res.json();

    alert(data.message || data.msg);

  } catch (err) {
    console.log(err);
    alert("Upload failed");
  } finally {
    btn.disabled = false;
    btn.innerText = "Import Grades";
  }

});


    }



        
    } catch (error) {
        return sendGradesCon.innerHTML = `
        <p class="text-center">Failed to load page.</p>
        `
    }
}


document.addEventListener('DOMContentLoaded', SendGrades)