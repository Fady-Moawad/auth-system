require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const routes = require('./routes/userRoutes')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { notFound, errorHandler } = require('./middleware/errorHanddling')

const app = express()
//securety
app.use(cors())
app.use(helmet())
console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('tiny'));
}

//parser json
app.use(express.json())

 app.use('/api/users', routes)
        app.use(notFound)
        app.use(errorHandler)

const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGOOSE_URL)
    .then(() => {
        console.log('mongoBD connection')
       
        app.listen(PORT, () => {
            console.log(`lsiten in PORT: ${PORT}`);
        })
    }
    ).catch((err) => {
        console.log(err);
    })

