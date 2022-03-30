const mongoose = require('mongoose')
const express = require('express')
const PaymentLink = require('../models/payment_link')
const router = express.Router()

router.get('/', (req, res) => {
    PaymentLink.find()
        .then(docs => {
            const result = {
                status: 'ok',
                status_code: 200,
                message: 'All Payment Links fetched',
                count: docs.length,
                payment_links: docs
            }
            res.status(result.status_code).json(result)
        })
        .catch((err) => {
            const result = {
                status: 'error',
                status_code: 500,
                error: err,
                message: err.message
            }
            res.status(500).json(result)
        })
})

router.post('/', (req, res) => {
    console.log(req.query)
    res.status(200).json({
        params: req.query
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