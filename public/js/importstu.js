const impCon = document.getElementById('impCon')
const schoolkey = localStorage.getItem('schoolKey') 


async function ImportStu() {
    try {

        impCon.innerHTML = `
                <div class="hero__ctas__cats d-flex justify-content-center align-items-center" style="min-height: 180px;">
    <div class="loading-spinner text-center main-spinner">
        <div class="spinner-border ls-text" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading Import Page ...</p>
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

        return impCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "admin") {

      impCon.innerHTML = `

<div class="container py-5">

  <div class="row justify-content-center">

    <div class="col-md-6">

      <div class="card shadow-sm border-0">

        <div class="card-header text-center">
          <h5 class="mb-0">
            Import Students From Excel
          </h5>
        </div>

        <div class="card-body">

          <form id="importStudentsForm">

            <div class="mb-3">
              <label class="form-label">
                Select Excel File
              </label>

              <input
                type="file"
                class="form-control"
                id="studentFile"
                accept=".xlsx,.xls"
                required
              >
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100">
              Import Students
            </button>

          </form>

          <div id="importMsg" class="mt-3 text-center"></div>

        </div>

      </div>

    </div>

  </div>

</div>

`;

 document
  .getElementById('importStudentsForm')
  .addEventListener('submit', async (e) => {

    e.preventDefault();

    const fileInput = document.getElementById('studentFile');
    const msg = document.getElementById('importMsg');

     if (!fileInput.files.length) {
      msg.innerHTML = `
        <span class="text-danger">
          Please select an Excel file.
        </span>
      `;
      return;
    }

    const formData = new FormData();

  formData.append('file', fileInput.files[0]);

try {

     msg.innerHTML = `
        <span class="text-muted">
          Uploading...
        </span>
      `;

      const response = await fetch('/admin/import-students', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${schoolkey}`
        },
        body: formData
      });

      const data = await response.json();


      if (data.msg) {
        msg.innerHTML = `
          <span class="text-danger">
            ${data.msg}
          </span>
        `;
        return;
      }

const imported = data?.imported

  impCon.innerHTML = `
<div class="container py-4">

  <div class="row g-4">

    ${
      imported?.map(student => `
      
      <div class="col-md-4">

        <div class="card h-100 shadow-sm border-0">

          <div class="card-body">

            <div class="text-center mb-3">
              <i class="ti ti-user fs-1 text-primary"></i>
            </div>

            <h5 class="card-title text-center">
              ${student.fullname}
            </h5>

            <hr>

            <p class="mb-2">
              <strong>Registration:</strong><br>
              ${student.student_reg}
            </p>

            <p class="mb-2">
              <strong>Email:</strong><br>
              ${student.email}
            </p>

            <p class="mb-0">
              <strong>Password:</strong><br>
              <span class="badge bg-warning text-dark">
                ${student.temporaryPassword}
              </span>
            </p>

          </div>

        </div>

      </div>

      `).join('')
    }

  </div>

</div>
`;
    
} catch (error) {
     console.log(error);

      msg.innerHTML = `
        <span class="text-danger">
          Failed to import students.
        </span>
      `;
    

}





  })

 


    }


        
    } catch (error) {
        return impCon.innerHTML = `
        <p class="text-center">failed to load page </p>
        `
    }
}


document.addEventListener('DOMContentLoaded', ImportStu)