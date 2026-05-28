const adminCon = document.getElementById('adminCon')
const schoolkey = localStorage.getItem('schoolKey') 

async function LoadDash() {
    try {

        adminCon.innerHTML = `
                <div class="hero__ctas__cats d-flex justify-content-center align-items-center" style="min-height: 180px;">
    <div class="loading-spinner text-center main-spinner">
        <div class="spinner-border ls-text" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading Administrator...</p>
    </div>
</div> 

        
        `
        
    } catch (error) {
        return adminCon.innerHTML = `
        <p class="text-center">Failed to load dashboard </p>
        `
    }

}

document.addEventListener('DOMContentLoaded', LoadDash)