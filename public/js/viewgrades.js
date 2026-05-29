const myGrdsCon = document.getElementById('myGrdsCon')
const schoolkey = localStorage.getItem('schoolKey') 

async function ViewGrades() {
    try {
        myGrdsCon.innerHTML = `
                <div class="hero__ctas__cats d-flex justify-content-center align-items-center" style="min-height: 180px;">
    <div class="loading-spinner text-center main-spinner">
        <div class="spinner-border ls-text" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading My Grades...</p>
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

        return myGrdsCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "student") {
          const reqStuGrades = await fetch('/student/get-my-grades', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${schoolkey}`
            }
          })   

          const resStuGrades = await reqStuGrades.json()


          if(resStuGrades?.msg) {
              return myGrdsCon.innerHTML = `
        <p class="text-danger text-center">${resStuGrades.msg} </p>
        `

          }

          const grades = resStuGrades?.grades;

myGrdsCon.innerHTML = `


<div class="grades-wrap">

  ${
    grades?.length
      ? grades.map(g => {

          const list = g.grades_list
            ? g.grades_list.split("\n").filter(x => x.trim() !== "")
            : [];

          return `
            <div class="grade-card">

              <div class="grade-title">
                ${g.module_name}
              </div>

              <div class="grade-meta">
                Module Grade Breakdown
              </div>

              <div>
                ${
                  list.map(item => `
                    <span class="badge-grade">${item}</span>
                  `).join("")
                }
              </div>

              <div class="lecturer">
                <strong>Lecturer:</strong> ${g.lctr?.fullname} <br/>
                <small>${g.lctr?.email}</small>
              </div>

            </div>
          `;
        }).join("")
      : `<p class="text-center text-muted">No grades available</p>`
  }

</div>

`;

    }

        
    } catch (error) {
        return myGrdsCon.innerHTML = `
        <p class="text-center">Failed to load grades </p>
        
        `
    }
}


document.addEventListener('DOMContentLoaded', ViewGrades)