const myFeesCon = document.getElementById('myFeesCon')
const schoolkey = localStorage.getItem('schoolKey') 


async function MyFees() {
    try {

        myFeesCon.innerHTML = `
                <div class="hero__ctas__cats d-flex justify-content-center align-items-center" style="min-height: 180px;">
    <div class="loading-spinner text-center main-spinner">
        <div class="spinner-border ls-text" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading your fees page...</p>
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

        return myFeesCon.innerHTML = `
        <p class="text-danger text-center">${data.msg} </p>
        `
    }


    if(data?.user?.role === "student") {

        const reqFbLnc = await fetch('/student/check-fees', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${schoolkey}`
        }

        })

       const resFbLnc = await reqFbLnc.json()
       
       if(resFbLnc.msg) {
        return myFeesCon.innerHTML = `
        <p class="text-danger text-center">${resFbLnc.msg} </p>
        `

       }

       const mystat = resFbLnc.mystat;

myFeesCon.innerHTML = `


<div class="fees-card">

  ${
    !mystat
      ? `
        <div class="fees-status" style="color:#b91c1c;">
          Fees Not Paid
        </div>

        <div class="fees-msg">
          You have not made any fee payment yet.
        </div>

        <button class="btn-pay">
          Pay Fees
        </button>
      `
      : mystat.status === "paid"
        ? `
          <div class="fees-status" style="color:#15803d;">
            Fees Paid
          </div>

          <div class="fees-msg">
            You have already completed your fee payment.
          </div>

          <button class="btn-pay btn-disabled" disabled>
            Already Paid
          </button>
        `
        : `
          <div class="fees-status" style="color:#b45309;">
            Payment Pending
          </div>

          <div class="fees-msg">
            Your payment is pending confirmation.
          </div>

          <button class="btn-pay">
            Complete Payment
          </button>
        `
  }

</div>

`;


document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-pay');
  if (!btn) return;

  
  btn.disabled = true;
  const originalText = btn.innerText;
  btn.innerText = "Processing...";

  try {

    const res = await fetch('/student/pay-fees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${schoolkey}`
      }
    });

    const data = await res.json();

    if (data.msg) {
      alert(data.msg);

      
      btn.disabled = false;
      btn.innerText = originalText;
      return;
    }

    if (data.message) {
      alert(data.message);

      
      btn.innerText = "Fees Paid";
      btn.style.background = "#6b7280";
      btn.style.cursor = "not-allowed";
      btn.disabled = true;
 window.location.reload()
      
      
    }

  } catch (err) {
    console.log("Payment error:", err);

    btn.disabled = false;
    btn.innerText = originalText;
  }
});


    }
        
    } catch (error) {
        return myFeesCon.innerHTML = `
        <p class="text-center"> Failed to load page </p>
        `
    }
}

document.addEventListener('DOMContentLoaded', MyFees)