const mongoose = require('mongoose')
const paymentLinkSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    razorpay_payment_id: {
        type: 'String'
    },
    razorpay_payment_link_id: {
        type: 'String'
    },
    razorpay_payment_link_reference_id: {
        type: 'String'
    },
    razorpay_payment_link_status: {
        type: 'String'
    },
    razorpay_signature: {
        type: 'String'
    }
})

module.exports = mongoose.model('Payment', paymentLinkSchema)