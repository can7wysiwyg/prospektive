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
         
        const reqStuds = await fetch(`/lecturer/students-enrolled`, {
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

        
        const enrolled = resStuds?.enrolled;

sendGradesCon.innerHTML = `


<div class="grades-wrapper">

  <div class="grades-title">
    Send Grades To Students
  </div>

  <div class="grades-subtitle text-center">
    To send grades to a student, click a student card below.
  </div>

  <div class="student-grid">

    ${
      enrolled?.map((student) => `
      
        <div 
          class="student-card"
          data-bs-toggle="modal"
          data-bs-target="#gradeModal"
          onclick="
            document.getElementById('studentName').innerText='${student.fullname}';
            document.getElementById('studentEmail').innerText='${student.email}';
            document.getElementById('sendGradeBtn').dataset.id='${student._id}';
            document.getElementById('sendGradeBtn').dataset.email='${student.email}';


          "
        >

          <div class="student-icon">
            <i class="ti ti-user"></i>
          </div>

          <div class="student-name">
            ${student.fullname}
          </div>

          <div class="student-info">
            ${student.email}
          </div>

          <div class="student-info">
            ${student.phone}
          </div>

        </div>

      `).join("")
    }

  </div>

</div>


<!-- MODAL -->
<div class="modal fade" id="gradeModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    
    <div class="modal-content">

      <div class="modal-header">
        <h5 class="modal-title">
          Send Grades
        </h5>

        <button 
          type="button" 
          class="btn-close btn-close-white"
          data-bs-dismiss="modal">
        </button>
      </div>

      <div class="modal-body">

  <div class="mb-3">
    <strong id="studentName"></strong>
    <div class="text-muted" id="studentEmail"></div>
  </div>

  <!-- MODULE NAME -->
  <div class="mb-3">
    <label class="form-label fw-semibold">
      Module Name
    </label>

    <input 
      type="text"
      class="form-control"
      id="module_name"
      placeholder="Enter module name"
    />
  </div>

  <!-- GRADES -->
  <div class="mb-3">
    <label class="form-label fw-semibold">
      Grades
    </label>

    <textarea 
      class="form-control"
      id="grades_list"
      rows="6"
      placeholder="Enter grades here...">
    </textarea>
  </div>

</div>
      <div class="modal-footer">
        <button 
          class="btn send-btn"
          id="sendGradeBtn"
          >
          Send Grades
        </button>
      </div>

    </div>

  </div>
</div>

`;

const sendGradeBtn = document.getElementById('sendGradeBtn')

sendGradeBtn.addEventListener('click', async () => {
  const modaltitle = document.querySelector('.modal-title')
  sendGradeBtn.disabled = true 
  sendGradeBtn.textContent = "Sending.."

  try {
    const studentId = sendGradeBtn.dataset.id;
  const studentEmail = sendGradeBtn.dataset.email;
  const grades_list = document.getElementById('grades_list').value.trim()
  const module_name = document.getElementById('module_name').value.trim()



  if(!studentId || !studentEmail || !grades_list || !module_name) {
    sendGradeBtn.disabled = false 
  sendGradeBtn.textContent = "Send Grades"

    return modaltitle.innerHTML = `<span class="text-danger">Values cannot be missing </span>`
  }

  const reqGrades = await fetch('/lecturer/send-grades', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${schoolkey}`
    },
    body: JSON.stringify({module_name, grades_list, studentEmail, studentId})
  })

  const resGrades = await reqGrades.json();

  if(resGrades.msg) {
    sendGradeBtn.disabled = false 
  sendGradeBtn.textContent = "Send Grades"

    return modaltitle.innerHTML = `<span class="text-danger">${resGrades.msg}</span>`


  } else if(resGrades.message) {
    alert(resGrades.message)
    window.location.reload()
  }
    
  } catch (error) {
    sendGradeBtn.disabled = false 
  sendGradeBtn.textContent = "Send Grades"

    return  modaltitle.innerHTML = `
    <span class="text-danger">Failed to send grades.. </span>
    `
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