const Sequelize = require('sequelize')
const { db } = require('../database/dbConfig')

const User = db.define("User", {
    email:{
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    names:{
        type: Sequelize.STRING
    },
    country: {
        type: Sequelize.STRING
    },
    phone:{
        type: Sequelize.STRING,
        defaultValue: null
    },
    type: {
        type: Sequelize.STRING,
        defaultValue: "user"
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: "active"
    },
    avatar: {
        type: Sequelize.STRING,
        defaultValue: `${process.env.SITE_URL}/images/avatar/default-avatar.jpg`
    },
    password: {
        type: Sequelize.STRING
    },
    otpCode:{
        type: Sequelize.STRING,
        defaultValue: null
    },
    otpLink:{
        type: Sequelize.STRING,
        defaultValue: null
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
})

User.associate = (models)=>{
    User.hasMany(models.Token, {
        onDelete: "cascade",
        hooks: true,
        onUpdate: "cascade",
        foreignKey: {
            name: "email",
            allowNull: false,
        }
    })

    User.hasMany(models.Podcast, {
        onDelete: "cascade",
        hooks: true,
        onUpdate: "cascade",
        foreignKey: {
            name: "email",
            allowNull: false,
        }
    })

    User.hasMany(models.Subscription, {
        onDelete: "cascade",
        hooks: true,
        onUpdate: "cascade",
        foreignKey: {
            name: "email",
            allowNull: false,
        }
    })
}

module.exports = User