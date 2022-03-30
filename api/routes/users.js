const mongoose = require('mongoose')
const express = require('express')
const User = require('../models/user')
const router = express.Router()
const Counter = require('../models/counter')
const PaymentLink = require('../models/payment')
const rzr = require('../razorpay/instance')
const nodemailer = require('nodemailer')


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
    const email = req.body.email
    let new_user = new User({
        _id: new mongoose.Types.ObjectId(),
        username: req.body.email.slice(0, email.indexOf('@')),
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
                callback_url: 'https://api-tedxvssut.herokuapp.com/payments/status/',
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

router.get('/status/:ref', (req, res) => {
    const ref_id = req.params.ref
    console.log(req.params)
    User.findOne({
            payment_reference_id: ref_id,
        })
        .then(u => {
            console.log(u)
            if (u) {
                res.status(200).json({
                    message: 'user fetched',
                    user: u
                })
            } else {
                const err = new Error('User doesn\'t exist')
                next(err)
            }
        })
        .catch(err => {
            console.log(err)
            next(err)
        })
})

module.exports = router