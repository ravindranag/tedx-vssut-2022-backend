const mongoose = require('mongoose')
const express = require('express')
const User = require('../models/user')
const router = express.Router()
const Counter = require('../models/counter')
const PaymentLink = require('../models/payment_link')
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
    Counter.updateOne({ name: 'userid' }, { $inc: { seq: 1 } }, { upsert: true })
        .then(r => {
            console.log(r)
            return Counter.findOne({ name: 'userid' })
        })
        .then(doc => {
            console.log(doc)
            new_user.id = doc.seq
            return new_user.save()
        })
        .then(user => {
            // const result = {
            //     status: 'created',
            //     status_code: 201,
            //     message: 'User created successfully',
            //     user: user
            // }
            // res.status(result.status_code).json(result)
            console.log('created user')
            const ref = user.institute === 'Veer Surendra Sai University of Technology' ? 'VSS' + user.id : 'OUT' + user.id
            console.log('ref', ref)
            return rzr.paymentLink.create({
                amount: 50000,
                currency: 'INR',
                reference_id: ref,
                description: 'Payment Link for Ticket no ' + ref,
                customer: {
                    name: user.first_name + ' ' + user.last_name,
                    contact: user.phone_no.toString(),
                    email: user.email
                },
                notify: {
                    sms: true,
                    email: true
                },
                reminder_enable: true,
                notes: {
                    event_name: 'TEDxVSSUT 2022',
                    user_id: user._id
                },
                callback_url: 'https://tedxvssut.com/tickets',
                callback_method: 'get'
            })
        })
        .then(p => {
            console.log('payment link created')
            const payment_link = new PaymentLink({
                _id: new mongoose.Types.ObjectId(),
                id: p.id,
                user: p.notes.user_id,
                payment_link: p
            })

            return payment_link.save()
        })
        .then(pl => {
            console.log('payment link saved')
            console.log(pl)
            return User.findOneAndUpdate({
                _id: pl.user
            }, {
                payment_link: pl.payment_link.get('short_url'),
                payment_id: pl.id
            }, {
                new: true
            })
        })
        .then(user => {
            console.log('user updated')
            transporter.sendMail({
                from: '"Fred Foo 👻" <admin@ecellvssut.tech>', // sender address
                to: `${user.email}`, // list of receivers
                subject: "Payment Link Generated ✅", // Subject line
                text: `payment link: ${user.payment_link}`, // plain text body
                html: `<p>Payment link: ${user.payment_link}</p>`, // html body
            })
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
            "reference_id": "VSS89",
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