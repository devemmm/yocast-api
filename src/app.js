require('./database/dbConfig')
const path = require('path')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const adminRouter = require('./routes/adminRoutes')
const userRouter = require('./routes/userRoutes')

const port = process.env.PORT
const app = express()

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(cors())
app.use(express.static(publicDirectoryPath))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(adminRouter)
app.use(userRouter)

app.listen(port, ()=> console.log(`server is running on port ${port}`))
