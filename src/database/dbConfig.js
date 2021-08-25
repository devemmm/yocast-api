const Sequelize = require('sequelize')

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_TYPE,
    operatorsAlliases: false,

    pool:{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

db.authenticate()
    .then(()=> console.log(`connected to databse`))
    .catch((error)=> console.log(`failed to connect to databse becouse ${error.message}`))

module.exports = { db }
