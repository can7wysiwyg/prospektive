
document.addEventListener('DOMContentLoaded', RoleCheck)

async function RoleCheck() {
    const authCont = document.getElementById('authCont');

    try {
  const schoolKey = localStorage.getItem('schoolKey')
     
    if(!schoolKey) {
        return;

    }

    const response = await fetch(`/auth/user-details`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${schoolKey}`
        }
    })

 
    const data = await response.json();

    
        if(!data || data.msg) {
            localStorage.removeItem('schoolKey')
            window.location.href ="/"
        return 
    }


    const user = data?.user

     

    if(user.role === "default") {
        return authCont.innerHTML = `
        <a href="#"><i class="ti ti-user" aria-hidden="true"></i>Pending</a></li>
        
        
        
        `
    }  else if(user.role === "admin") {

        return authCont.innerHTML = `
                <a href="/admindash"><i class="ti ti-user" aria-hidden="true"></i>Dashboard</a></li>

        
        
        `;
    } else if(user.role === "student") {
        return authCont.innerHTML = `
       
        <a href="/studentpanel"><i class="ti ti-book" aria-hidden="true"></i>My Panel</a>
       
        
        
        
        `
        
    } 
    else if(user.role === "lecturer") {
        return authCont.innerHTML = `
        <a href="/lecturertasks"><i class="ti ti-tools" aria-hidden="true"></i>Tasks</a></li>
         
        `
        
    } 
    
    else {
        return authCont.innerHTML = `
        
        
        `
    }



        
    } catch (error) {
          console.log("hey", error.message)
       return
        
    }

}