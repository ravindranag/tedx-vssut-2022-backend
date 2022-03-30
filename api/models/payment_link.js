const mongoose = require('mongoose')
const paymentLinkSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    id: {
        type: 'String'
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    payment_link: {
        type: Map
    }
})

module.exports = mongoose.model('PaymentLink', paymentLinkSchema)