const viewStudsCon = document.getElementById('viewStudsCon')

const schoolkey = localStorage.getItem('schoolKey') 


async function ViewStudents() {
    try {

        viewStudsCon.innerHTML = `
        
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
        return viewStudsCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "admin") {

        const reqLec = await fetch('/admin/view-students', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${schoolkey}`
            }
        }) 

        const resLec = await reqLec.json()

        if(resLec.msg) {

      return  viewStudsCon.innerHTML = `
      <p class="text-center">${resLec.msg} </p>
      `


        }

       
       viewStudsCon.innerHTML = `
    <div class="container">
    <div class="text-center" style="margin-top: 3.5rem;">

    <div class="row g-4 ">

<ul style="list-style:none; padding:0; margin:0; width:100%;">

${
resLec?.students?.map(item => `
  
<li class="col-md-12" style="margin-bottom:16px;">

  <div class="card" style="
      border-radius:10px;
      border:1px solid #e6e6e6;
      box-shadow:0 4px 10px rgba(0,0,0,0.05);
      padding:18px;
  ">

    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">

      <div>

        <h6 style="margin:0; font-weight:600;">
          <i class="fas fa-user" style="color:#0d6efd; margin-right:6px;"></i>
          ${item.fullname}
        </h6>

        
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap;">

        <button data-id="${item._id}" class="btn btn-sm btn-danger my-delete"
           style="display:flex; align-items:center; gap:5px;">
           <i class="fas fa-pen"></i>
           Manage Student
        </button>

      </div>

    </div>

  </div>

</li>

`).join('')
}

</ul>

</div>

  



  </div>
  </div>

       `  



    }


} catch(error) {

    return viewStudsCon.innerHTML = `
    <p class="text-center">Failed to load page </p>
    `
}


}


document.addEventListener('DOMContentLoaded', ViewStudents)