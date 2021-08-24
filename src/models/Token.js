const Sequelize = require('sequelize')
const { db } = require('../database/dbConfig')


const Token = db.define("Token", {
    token:{
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    owner:{
        type: Sequelize.STRING,
        references: { model: "Users", key: "email", onDelete: "CASCADE" }
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
})

Token.associate = (models)=>{
    Token.belongsTo(models.User, {
        foreignKey: "email"
    })
}

module.exports = Token