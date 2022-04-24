const express = require('express')

// create our Router object 
const baseRouter = express.Router()

// import demo controller functions 
const baseController = require('../controllers/baseController')

// add a route to handle the GET request for all demo data 
baseRouter.get('/', (req, res) => { 
    res.send('<img src="images/beacon.png">');
});

baseRouter.get('/healing-calc', (req, res) => {
    res.render('healing_calc', {layout: false})
});
baseRouter.get('/healing_calc', (req, res) => {
    res.render('healing_calc', {layout: false})
});

baseRouter.get('/damage-calc', (req, res) => {
    res.render('damage_calc', {layout: false})
})
baseRouter.get('/damage_calc', (req, res) => {
    res.render('damage_calc', {layout: false})
})

//clinicianRouter.get('/:id', clinicianController.clinicianDemo);

// export the router 
module.exports = baseRouter;