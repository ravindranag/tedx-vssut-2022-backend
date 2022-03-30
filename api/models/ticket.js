const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    user: {
        type: Map,
        ref: 'User',
        required: true
    },
    ticket_id: {
        type: 'String'
    },
})

module.exports = mongoose.model('Ticket', ticketSchema)