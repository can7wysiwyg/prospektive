const addUserCon = document.getElementById('addUserCon')
const schoolkey = localStorage.getItem('schoolKey') 


async function AddUser() {
    try {

        addUserCon.innerHTML = `
        
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
        return adminCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "admin") {

         addUserCon.innerHTML = `
         
                    <div style="max-width:1000px; margin-top: 3.3rem; margin-bottom: 3.3rem; margin:0 auto; background:#fff; border-radius:16px; box-shadow:0 12px 40px rgba(0,0,0,0.12); overflow:hidden;">
                    <div style="background:#007bff; color:#fff; padding:32px; text-align:center;">
        <h1 style="margin:0; font-size:2.3rem; font-weight:700;">
          <i class="fas fa-user"></i> Add User
        </h1>
        <p id="statusMessage" style="margin:12px 0 0; font-size:1rem; opacity:0.9; min-height:28px;"></p>
      </div>


              <div style="padding:32px;">
          <form id="cForm" >
          

            <div style="margin-bottom:24px;">
              <label style="display:block; margin-bottom:8px; font-weight:600;"> Name <span style="color:red;">*</span></label>
              <input type="text" id="fullname" required placeholder="Fullname" style="width:100%; padding:14px; border:1px solid #ddd; border-radius:8px;">
            </div>
               
            <div style="margin-bottom:24px;">
              <label style="display:block; margin-bottom:8px; font-weight:600;"> Email <span style="color:red;">*</span></label>
              <input type="email" id="email" required placeholder="Email" style="width:100%; padding:14px; border:1px solid #ddd; border-radius:8px;">
            </div>
            <div style="margin-bottom:24px;">
              <label style="display:block; margin-bottom:8px; font-weight:600;"> Phone  <span style="color:red;">*</span></label>
              <input type="text" id="phone" required placeholder="Phone" style="width:100%; padding:14px; border:1px solid #ddd; border-radius:8px;">
            </div>

            <div style="margin-bottom:24px;">
              <label style="display:block; margin-bottom:8px; font-weight:600;"> Date of Birth <span style="color:red;">*</span></label>
              <input type="date" id="dob" required placeholder="Date of Birth" style="width:100%; padding:14px; border:1px solid #ddd; border-radius:8px;">
            </div>



              <div style="margin-bottom:24px;">
              <label style="display:block; margin-bottom:8px; font-weight:600;"> Password <span style="color:red;">*</span></label>
              <input type="password" id="password" required placeholder="Password" style="width:100%; padding:14px; border:1px solid #ddd; border-radius:8px;">
            </div>


            
            <div style="margin-bottom:24px;">
              <label style="display:block; margin-bottom:8px; font-weight:600;">Find District <span style="color:red;">*</span></label>
              <select id="role" required style="width:100%; padding:14px; border:1px solid #ddd; border-radius:8px;">
                <option value="">Select User Type</option>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>


              </select>
            </div>

            
            <div style="display:flex; gap:16px; justify-content:flex-end;">
              
              <button type="submit" id="submitBtn" style="padding:14px 36px; background:#007bff; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600;">
                <span id="btnText">Add User</span>
                
              </button>
            </div>
          </form>
        </div>

         </div>       
                  
         `

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
            const dob = document.getElementById('dob').value 
            const password = document.getElementById('password').value 
            const role = document.getElementById('role').value
           
        const Cacc = await fetch('/admin/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${schoolkey}`
            },
            body: JSON.stringify({fullname, email, phone, role, dob, password})
        })
            

        resAcc = await Cacc.json() 

        if(resAcc.msg) {
                      submitBtn.disabled = false
                    submitBtn.textContent = "Submit" 

            return statusMessage.innerHTML = `
                    <span>${resAcc.msg} </span>
                    
                    `

        } else if(resAcc.message) {
                      submitBtn.disabled = false 
                    submitBtn.textContent = "Submit" 
  

            return statusMessage.innerHTML = `
                    <span>${resAcc.message} </span>
                    
                    `


        }
            
                    
                 } catch (error) {
                     submitBtn.disabled = false
          submitBtn.textContent = "Submit" 

                    
                    return statusMessage.innerHTML = `
                    <span>${error.message} </span>
                    
                    `
                    
                 }


       })


    }

        
    } catch (error) {
        return addUserCon.innerHTML = `
        <p class="text-center">Failed to load page </p>
        `
    }

}


document.addEventListener('DOMContentLoaded', AddUser)