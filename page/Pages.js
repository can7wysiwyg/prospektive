import express from "express"
const Pages = express.Router()

Pages.get('/', async(req, res) => {
try {

    res.render('index')
    
} catch (error) {
    console.error(`failed to load home page, ${error}`)
    return res.redirect('/')
}

})


Pages.get('/account', async(req, res) => {
try {

    res.render('account')
    
} catch (error) {
    console.error(`failed to load account page, ${error}`)
    return res.redirect('/')
}

})


Pages.get('/admindash', async(req, res) => {
try {

    res.render('admindash')
    
} catch (error) {
    console.error(`failed to load admindash page, ${error}`)
    return res.redirect('/')
}

})



export default Pages