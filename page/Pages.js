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


Pages.get('/adduser', async(req, res) => {
try {

    res.render('adduser')
    
} catch (error) {
    console.error(`failed to load adduser page, ${error}`)
    return res.redirect('/')
}

})


Pages.get('/systemlecturers', async(req, res) => {
try {

    res.render('systemlecturers')
    
} catch (error) {
    console.error(`failed to load adduser page, ${error}`)
    return res.redirect('/')
}

})


Pages.get('/systemstudents', async(req, res) => {
try {

    res.render('systemstudents')
    
} catch (error) {
    console.error(`failed to load adduser page, ${error}`)
    return res.redirect('/')
}

})


Pages.get('/lecturertasks', async(req, res) => {
try {

    res.render('lecturertasks')
    
} catch (error) {
    console.error(`failed to load lecturertasks page, ${error}`)
    return res.redirect('/')
}

})


Pages.get('/sendgrades', async(req, res) => {
try {

    res.render('sendgrades')
    
} catch (error) {
    console.error(`failed to load sendgrades page, ${error}`)
    return res.redirect('/')
}

})


Pages.get('/studentpanel', async(req, res) => {
try {

    res.render('studentpanel')
    
} catch (error) {
    console.error(`failed to load studentpanel page, ${error}`)
    return res.redirect('/')
}

})


Pages.get('/myprofile', async(req, res) => {
try {

    res.render('myprofile')
    
} catch (error) {
    console.error(`failed to load myprofile page, ${error}`)
    return res.redirect('/')
}

})


Pages.get('/viewgrades', async(req, res) => {
try {

    res.render('viewgrades')
    
} catch (error) {
    console.error(`failed to load viewgrades page, ${error}`)
    return res.redirect('/')
}

})

Pages.get('/myfees', async(req, res) => {
try {

    res.render('myfees')
    
} catch (error) {
    console.error(`failed to load myfees page, ${error}`)
    return res.redirect('/')
}

})




export default Pages