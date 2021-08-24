const Sequelize = require('sequelize')

const db = new Sequelize('yocast', 'root', '', {
    host: process.env.DB_HOST,
    dialect: 'mysql',
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
