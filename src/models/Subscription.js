const Sequelize = require('sequelize')
const { db } = require('../database/dbConfig')


const Subscription = db.define("Subscription", {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    owner:{
        type: Sequelize.STRING,
        references: { model: "Users", key: "email", onDelete: "CASCADE" }
    },
    transactionId:{
        type: Sequelize.STRING
    },
    paymentStatus:{
        type: Sequelize.ENUM("PENDING", "SUCCESS", "FAILED"),
        default: 'PENDING'
    },
    paymentMode:{
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.STRING
    },
    price:{
        type: Sequelize.INTEGER
    },
    currency:{
        type: Sequelize.ENUM("RWF", "USD", "EUR", "AOA", "DZD"),
        default: 'RWF'
    },
    desactivationDate: Sequelize.DATE,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
})


Subscription.associate = (models)=>{
    Subscription.belongsTo(models.User, {
        foreignKey: "email"
    })
}


module.exports = Subscription