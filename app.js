require('./src/database/dbConfig')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerJsDocs = YAML.load('./api.yaml')

const adminRouter = require('./src/routes/adminRoutes')
const userRouter = require('./src/routes/userRoutes')

const port = process.env.PORT
const app = express()

const publicDirectoryPath = path.join(__dirname, './public')

app.use(cors())
app.use(express.static(publicDirectoryPath))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerJsDocs))
app.use(adminRouter)
app.use(userRouter)

app.listen(port, ()=> console.log(`server is running on port ${port}`))
