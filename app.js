require('dotenv-flow').config();
require('./src/database/dbConfig')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerJsDocs = YAML.load('./api.yaml')
const hbs = require('hbs')
const favicon = require('serve-favicon');

const adminRouter = require('./src/routes/adminRoutes')
const userRouter = require('./src/routes/userRoutes')
const publicRoute = require('./src/routes/publicRoutes')

const port = process.env.PORT
const app = express()

const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname, './template/views')
const partialPath = path.join(__dirname, './template/partials')

app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(cors())
app.set('view engine', 'hbs')
app.set('views', viewsPath)
app.use(express.static(publicDirectoryPath))

hbs.registerPartials(partialPath)

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJsDocs))
app.use(publicRoute)
app.use(adminRouter)
app.use(userRouter)

module.exports = app;