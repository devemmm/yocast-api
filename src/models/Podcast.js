const Sequelize = require('sequelize')
const { db } = require('../database/dbConfig')


const Podcast = db.define("Podcast", {
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
    name: {
        type: Sequelize.STRING
    },
    url: {
        type: Sequelize.STRING
    },
    cover:{
        type: Sequelize.STRING,
        defaultValue: `${process.env.SITE_URL}/images/background/yocast.jpeg`
    },
    category: {
        type: Sequelize.STRING,
        defaultValue: "Business"
    },
    description: {
        type: Sequelize.STRING
    },
    price: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    likes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    views: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    isFree:{
        type: Sequelize.BOOLEAN, 
        defaultValue: false
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
})

Podcast.associate = (models)=>{
    Podcast.belongsTo(models.User, {
        foreignKey: "email"
    })
}

module.exports = Podcast