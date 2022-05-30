const express = require('express')

const baseRouter = express.Router()

const baseController = require('../controllers/baseController')

baseRouter.get('/', (req, res) => { 
    res.render('damage_calc', {layout: false})
});
baseRouter.get('/healing-calc', (req, res) => {
    res.render('healing_calc', {layout: false})
});
baseRouter.get('/healing_calc', (req, res) => {
    res.render('healing_calc', {layout: false})
});

baseRouter.get('/healing-calc-ptr', (req, res) => {
    res.redirect('/healing-calc')
});
baseRouter.get('/healing_calc_ptr', (req, res) => {
    res.redirect('/healing-calc')
});

baseRouter.get('/damage-calc', (req, res) => {
    res.render('damage_calc', {layout: false})
})
baseRouter.get('/damage_calc', (req, res) => {
    res.render('damage_calc', {layout: false})
})

baseRouter.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = baseRouter;