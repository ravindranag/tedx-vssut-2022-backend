const mongoose = require('mongoose')
const express = require('express')
const User = require('../models/user')
const router = express.Router()
const Counter = require('../models/counter')
const PaymentLink = require('../models/payment')
const Razorpay = require('razorpay')
const nodemailer = require('nodemailer')

const rzr = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret
})


const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'lucienne.morissette4@ethereal.email',
        pass: 'BNZHYq64skMNpgrpnb'
    }
});
router.get('/', (req, res) => {
    User.find()
        .then(docs => {
            const result = {
                status: 'ok',
                status_code: 200,
                count: docs.length,
                users: docs
            }
            res.status(result['status_code']).json(result)
        })
        .catch(err => {
            const result = {
                status: 'error',
                status_code: err.status,
                message: err.message
            }
            res.status(result.status_code).json(result)
        })
})

router.post('/', (req, res, next) => {
    let new_user = new User({
        _id: new mongoose.Types.ObjectId(),
        ...req.body
    })
    Counter.findOneAndUpdate({ name: 'userid' }, { $inc: { seq: 1 } }, { upsert: true, new: true })
        .then(doc => {
            console.log(doc)
            new_user.id = doc.seq
            const ref = new_user.institute === 'Veer Surendra Sai University of Technology' ? 'VSS' + new_user.id : 'OUT' + new_user.id
            console.log('ref', ref)
            return rzr.paymentLink.create({
                amount: 50000,
                currency: 'INR',
                reference_id: ref,
                description: 'Payment Link for Ticket no ' + ref,
                expire_by: 1650047340,
                customer: {
                    name: new_user.first_name + ' ' + new_user.last_name,
                    contact: new_user.phone_no.toString(),
                    email: new_user.email
                },
                notify: {
                    sms: true,
                    email: true
                },
                reminder_enable: true,
                notes: {
                    event_name: 'TEDxVSSUT 2022',
                    user_id: new_user._id
                },
                callback_url: 'https://api-tedxvssut.herokuapp.com/payments/',
                callback_method: 'get'
            })
        })
        .then(p => {
            console.log('payment link created')
            new_user.payment_link = p.short_url
            new_user.payment_id = p.id
            new_user.payment_reference_id = p.reference_id
            return new_user.save()
        })
        .then(user => {
            console.log('user updated')
                // transporter.sendMail({
                //     from: '"Fred Foo 👻" <admin@ecellvssut.tech>', // sender address
                //     to: `${user.email}`, // list of receivers
                //     subject: "Payment Link Generated ✅", // Subject line
                //     text: `payment link: ${user.payment_link}`, // plain text body
                //     html: `<p>Payment link: ${user.payment_link}</p>`, // html body
                // })
            const result = {
                status: 'created',
                message: 'payment link generated for user',
                user: user
            }
            res.status(201).json(result)
        })
        .catch(err => {
            console.log(err)
            const result = {
                status: 'failed',
                status_code: 500,
                message: err
            }
            res.status(result.status_code).json(result)
        })
})

router.get('/pay', (req, res, next) => {
    rzr.paymentLink.create({
            "amount": 50000,
            "currency": "INR",
            "reference_id": "VSS8999",
            "description": "Payment for policy no #23456",
            "customer": {
                "name": "Gaurav Kumar",
                "contact": "+919999999999",
                "email": "gaurav.kumar@example.com"
            },
            "notify": {
                "sms": true,
                "email": true
            },
            "reminder_enable": true,
            "notes": {
                "event_name": "TEDxVSSUT 2022"
            },
            "callback_url": "https://example-callback-url.com/",
            "callback_method": "get"
        })
        .then(r => {
            res.status(201).json({
                id: r.id,
                p: r
            })
        })
        .catch(err => {
            next(err)
        })
        // const result = {
        //     message: 'your payment link'
        // }
        // res.status(200).json(result)
})

router.get('/generate-payment-link', (req, res) => {
    const newUser = new User(req.body)
    console.log(newUser)
    const ref = 'VSS' + newUser.email.slice(-3)
    console.log(ref)
        // rzr.paymentLink.create({
        //         "amount": 1000,
        //         "currency": "INR",
        //         "expire_by": 1691097057,
        //         "reference_id": ref,
        //         "description": "Payment for policy no #23456",
        //         "customer": {
        //             "name": newUser.first_name + ' ' + newUser.last_name,
        //             "contact": newUser.phone_no,
        //             "email": newUser.email
        //         },
        //         "notify": {
        //             "sms": true,
        //             "email": true
        //         },
        //         "reminder_enable": true,
        //         "notes": {
        //             "event_name": "TEDxVSSUT 2022"
        //         },
        //         "callback_url": "https://example-callback-url.com/",
        //         "callback_method": "get"
        //     })
        //     .then(res => console.log(res))
        //     .catch(err => {
        //         next(err)
        //     })
    res.status(201).json({
        message: 'received',
        user: newUser
    })
})

router.get('/pay/:id', (req, res) => {
    const id = req.params.id
    rzr.paymentLink.fetch(id)
        .then(p => {
            const result = {
                id: id,
                payment: p
            }
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json({ error: err })
        })
})

module.exports = router