const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    id: {
        type: 'Number',
        unique: true,
        index: true,
        required: true
    },
    first_name: {
        type: 'String',
        required: true,
    },
    last_name: {
        type: 'String',
        required: true,
    },
    email: {
        type: 'String',
        required: true,
        unique: true,
        index: true
    },
    phone_no: {
        type: 'Number',
        required: true,
        unique: true,
        index: true
    },
    institute: {
        type: 'String',
        required: true,
    },
    registration_no: {
        type: 'Number',
        default: null
    },
    is_registered: {
        type: 'Boolean',
        default: false
    },
    payment_link: {
        type: 'String',
        default: null
    },
    payment_id: {
        type: 'String',
        default: null
    },
    payment_reference_id: {
        type: 'String',
        default: null
    },
    ticket: {
        type: mongoose.Types.ObjectId,
        ref: 'Ticket',
        default: null
    },
    t_shirt_size: {
        type: 'String',
        required: true
    }
})

const User = mongoose.model('User', userSchema)
User.createIndexes()

module.exports = User