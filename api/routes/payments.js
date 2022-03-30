const mongoose = require('mongoose')
const express = require('express')
const Payment = require('../models/payment')
const User = require('../models/user')
const Ticket = require('../models/ticket')
const router = express.Router()


router.get('/', (req, res) => {
    console.log('query', req.query)
    const new_payment = new Payment({
        ...req.query
    })
    if (new_payment.razorpay_payment_link_status === 'paid') {
        User.find({
                payment_reference_id: new_payment.razorpay_payment_link_status
            }).then(doc => {
                const new_ticket = new Ticket({
                    _id: new mongoose.Types.ObjectId(),
                    user: doc._id,
                    ticket_id: doc.payment_reference_id
                })

                return new_ticket.save()
            })
            .then(t => {
                const filter = {
                    payment_id: new_payment.razorpay_payment_id
                }
                const update = {
                    is_registered: true,
                    ticket: t._id
                }
                const options = {
                    new: true
                }
                return User.findOneAndUpdate(filter, update, options)
            })
            .then(u => {
                new_payment.user = u._id
                return new_payment.save()
            })
            .then(p => {
                res.status(200).json({
                        message: 'Success',
                        user: User.find({ _id: p.user }).populate('ticket')
                    })
                    // res.redirect(`https://tedxvssut.com/ticket/status/?user=${p.user}`)
            })
            .catch(err => {
                console.log(err.message)
                next(err)
            })
    } else {
        res.status(400).json({
            message: new_payment.razorpay_payment_link_status
        })
    }
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