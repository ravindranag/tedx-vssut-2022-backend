const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const userRoutes = require('./api/routes/users')
const paymentLinkRoutes = require('./api/routes/payments')
mongoose.connect(process.env.MONGO_DB_URI)

const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization, Accept')
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
        return res.status(200).json({})
    }
    next()
})
app.use('/users', userRoutes)
app.use('/payments', paymentLinkRoutes)

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