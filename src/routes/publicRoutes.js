const express = require('express')
const router = express.Router()

router.get('/about', (req, res)=>{
    res.render('about')
})

router.get('/contact', (req, res)=>{
    res.render('contact')
})

router.get('/', (req, res)=>{
    res.render('index')
})

router.get('/service', (req, res)=>{
    res.render('service')
})


module.exports = router;