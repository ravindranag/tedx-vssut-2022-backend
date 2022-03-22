const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')

mongoose.connect(process.env.MONGO_DB_URI)

const app = express()

app.use(morgan('dev'))

app.use('/users', (req, res, next) => {
    res.status(200).json({
        message: 'Success'
    })
})

app.use((req, res, next) => {
    const error = new Error('Endpoint doesn\'t exists')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    const result = {
        message: error.message,
        status: error.status,
        error: error
    }
    res.status(404).json(result)
})

module.exports = app