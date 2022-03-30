const Razorpay = require('razorpay')

const rzr = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret
})

module.exports = rzr