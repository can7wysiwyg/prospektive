const navmenu = document.getElementById('navmenu')
const school = localStorage.getItem('schoolKey')


async function LoadMenu() {
    try {

        navmenu.innerHTML = `
        <h2 class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Westbrook Academy Online Portal — home page demo with navigation bar, quick access, and announcements</h2>

<!-- NAVBAR -->
<nav class="school-nav">
  <a href="#" class="brand">
    <div class="brand-crest">DB</div>
    <div>
      <div class="brand-name">Don Bosco</div>
      <div class="brand-sub">Student Portal</div>
    </div>
  </a>
  <ul class="nav-links">
    <li><a href="#" class="active"><i class="ti ti-home" aria-hidden="true"></i>Home</a></li>
          <li id="authCont">  </li>
    <li id="authLink"></li>
  </ul>
</nav>

        
        
        `


        if(!school) {
        
        return;

    } else if(school) {

        setInterval(() => {

       const renew = async() => {
           try {
            
             await fetch(`/auth/check-session?userKey=${school}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
           } catch (error) {
            return
           }
        


       }

       renew()

        

    }, 60000)



    }


        
    } catch (error) {
        return navmenu.innerHTML = `
        <h1 class="text-center">Failed to load navigation menu </h1>
        `
    }
}




document.addEventListener('DOMContentLoaded', LoadMenu)