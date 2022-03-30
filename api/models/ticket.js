const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ticketId: {
        type: 'String'
    },
    payment_link: {
        type: mongoose.Types.ObjectId,
        ref: 'PaymentLink'
    },

})

module.exports = mongoose.model('Ticket', ticketSchema)