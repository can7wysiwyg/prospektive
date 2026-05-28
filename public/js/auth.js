
document.addEventListener("DOMContentLoaded", Authenticate);

async function Authenticate() {
  const authLnk = document.getElementById("authLink");

  try {
     console.log("hey")
     const schoolKey = localStorage.getItem('schoolKey')

    const logout = async () => {
      try {
        console.log(1)
        const logoutRequest = await fetch(`/auth/logout-user`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${schoolKey} `,
          },
        });

        if (!logoutRequest) {
          throw new Error("Server Error");
        }

        localStorage.removeItem("schoolKey");

        window.location.href = "/";
      } catch (error) {
        console.log("signing out problem", error.message);
      }
    };

    if (!schoolKey) {
      const divAuth = document.createElement("div");

      divAuth.innerHTML = `
            
                         <a href="/account" class="nav-cta"><i class="ti ti-user" aria-hidden="true"></i>Sign In</a>
                        
            
            `;

      authLnk.append(divAuth);
    } else {
      const divAuth = document.createElement("div");
      
     
      divAuth.innerHTML = `
      <a href="#" id="logoutbtn" class="nav-cta"><i class="ti ti-user"  aria-hidden="true"></i>Sign Out</a>
              
                        
            
            `;

         
      authLnk.append(divAuth);
      document.getElementById("logoutbtn").addEventListener("click", logout);
    }
  } catch (error) {
    console.log(error.message);
  }
}