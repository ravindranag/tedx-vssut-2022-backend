const mongoose = require('mongoose')

const counterSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: {
        type: 'String',
        index: true,
        unique: true,
    },
    seq: Number
})
const Counter = mongoose.model('Counter', counterSchema)
Counter.createIndexes()

module.exports = Counter