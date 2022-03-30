const mongoose = require('mongoose')
const express = require('express')
const PaymentLink = require('../models/payment')
const router = express.Router()


router.get('/', (req, res) => {
    console.log('query', req.query)
    res.status(200).json({
        params: req.query,
        body: req.body
    })
})

router.get('/:id', (req, res) => {
    const id = req.params.id
    PaymentLink.findById(id)
        .then(doc => {
            const result = {
                status: 'ok',
                status_code: 200,
                payment_link: doc
            }
            res.status(200).json(result)
        })
        .catch(err => {
            const result = {
                status: 'error',
                status_code: 500,
                message: err.message,
                error: err
            }
            res.status(500).json(result)
        })
})

// router.get('/create', (req, res) => {

// })
module.exports = router