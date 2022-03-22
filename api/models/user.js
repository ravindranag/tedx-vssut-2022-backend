const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    firstName: {
        type: 'String',
        required: true,
    },
    lastName: {
        type: 'String',
        required: true,
    },
    institute: {
        type: 'String',
        required: true,
    },
    registrationNo: {
        type: 'Number'
    },
    isRegistered: {
        type: 'Boolean',
        default: false
    },
    ticket: {
        type: mongoose.Types.ObjectId,
        ref: 'Ticket',
        default: null
    },
    tShirtSize: {
        type: 'String',
        required: true
    }
})

module.exports = mongoose.model('User', userSchema)