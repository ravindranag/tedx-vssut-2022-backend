const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    no: {
        type: 'String'
    },
    user: {
        type: Map,
        ref: 'User',
        required: true
    },
    ticket_id: {
        type: 'String',
        required: true
    },
})

module.exports = mongoose.model('Ticket', ticketSchema)