const { QueryTypes } = require('sequelize')
const { db } = require('../database/dbConfig')
const Podcast = require('../models/Podcast')
const User = require('../models/User')
const Token = require('../models/Token')
const Subscription = require('../models/Subscription')

// db.sync()
//     .then((result)=> console.log("table created"))
//     .catch((error)=> console.log("error ocpaied", error.message))

const create = async(data, type)=>{
    try {

        switch(type){
            case 'podcast':
                return  await Podcast.create({
                    ...data
                })

            case 'user':
                return await User.create({
                    ...data
                })

            case 'token':
                return await Token.create({
                    ...data
                })
            case 'subscription':
                return await Subscription.create({
                    ...data
                })
            default:
                throw new Error('you must specify data type for domain before create')
        }
    } catch (error) {
        throw new Error(error.message)
    }
}

const findAllPodcast = async()=>{

    try {
        // const podcast = await Podcast.findAll(); 
        const podcasts = await db.query(`SELECT Podcasts.id, Podcasts.owner, Users.names as ownerName, Podcasts.name, Podcasts.url, Podcasts.cover, Podcasts.category, Podcasts.description, Podcasts.price, Podcasts.likes, Podcasts.views, Podcasts.isFree, Podcasts.createdAt, Podcasts.updatedAt FROM Users RIGHT JOIN Podcasts ON Users.email = Podcasts.owner ORDER BY Podcasts.createdAt DESC LIMIT 10;`, QueryTypes.SELECT);
        return podcasts[0]
    } catch (error) {
        throw new Error(error.message)
    }
}

const findByPk = async(pk, type)=>{
    try {
        switch(type){
            case 'user':
                return await User.findByPk(pk)
            case 'podcast':
                return await Podcast.findByPk(pk)
            case 'token':
                return await Token.findByPk(pk)
            default:
                break
        }
    } catch (error) {
        throw new Error(error.message)
    }
}

const update = async(data, type)=>{
    try {
        let podcast = null
        switch(type){
            case 'user':
                let user = await User.findByPk(data.email)

                Object.entries(data).forEach(update => {
                    user[update[0]] = update[1] 
                });
                return await user.save()
            case 'podcast':
                podcast = await Podcast.findByPk(data.id)

                Object.entries(data).forEach(update => {
                    podcast[update[0]] = update[1] 
                });

                return await podcast.save()
            case 'views':
                podcast = await Podcast.findByPk(data)
                podcast.views = podcast.views + 1
      
                return await podcast.save();

            case 'likes':
                podcast = await Podcast.findByPk(data)
                podcast.likes = podcast.likes + 1

                return await podcast.save();

            default:
                break;
        }
    } catch (error) {
        throw new Error(error.message)
    }
}

const remove = async(pk, type, kind)=>{
    try {
        switch(type){
            case 'podcast':
                const podcast = await Podcast.findByPk(pk)

                if(!podcast){
                    throw new Error("podcast not found")
                }

                return await podcast.destroy()
            case 'token':
                const token = await Token.findByPk(pk)

                if(!token){
                    throw new Error("token not found")
                }

                if(kind === "all"){
                    return await Token.destroy({where: {owner: token.dataValues.owner}})
                }

                return await token.destroy()
            default: 
                return {}
        }
    } catch (error) {
        throw new Error(error.message)
    }
}

const findSubscriptions = async(email)=>{
    try {
        return await Subscription.findAll({owner: email, limit: 100, order: [['updatedAt', 'DESC']]})
    } catch (error) {
        throw new Error(error.message)
    }
}

const filterBy = async(type)=>{
    try {
        let podcasts = null;
        switch(type){
            case 'recent':
                // return await Podcast.findAll({limit: 10, order: [['updatedAt', 'DESC']]})
                podcasts = await db.query('SELECT Podcasts.id, Podcasts.owner, Users.names as ownerName, Podcasts.name, Podcasts.url, Podcasts.cover, Podcasts.category, Podcasts.description, Podcasts.price, Podcasts.likes, Podcasts.views, Podcasts.isFree, Podcasts.createdAt, Podcasts.updatedAt FROM Users RIGHT JOIN Podcasts ON Users.email = Podcasts.owner ORDER BY Podcasts.updatedAt DESC LIMIT 10;', QueryTypes.SELECT)
                return podcasts[0]
            case 'popular':
                // return await Podcast.findAll({limit: 10, order:[['views', 'DESC']]})
                podcasts = await db.query('SELECT Podcasts.id, Podcasts.owner, Users.names as ownerName, Podcasts.name, Podcasts.url, Podcasts.cover, Podcasts.category, Podcasts.description, Podcasts.price, Podcasts.likes, Podcasts.views, Podcasts.isFree, Podcasts.createdAt, Podcasts.updatedAt FROM Users RIGHT JOIN Podcasts ON Users.email = Podcasts.owner ORDER BY Podcasts.views DESC LIMIT 10;', QueryTypes.SELECT)
                return podcasts[0]
            case 'price':
                // return await Podcast.findAll({limit: 10, order:[['price', 'DESC']]})
                podcasts = await db.query('SELECT Podcasts.id, Podcasts.owner, Users.names as ownerName, Podcasts.name, Podcasts.url, Podcasts.cover, Podcasts.category, Podcasts.description, Podcasts.price, Podcasts.likes, Podcasts.views, Podcasts.isFree, Podcasts.createdAt, Podcasts.updatedAt FROM Users RIGHT JOIN Podcasts ON Users.email = Podcasts.owner ORDER BY Podcasts.price DESC LIMIT 10;', QueryTypes.SELECT)
                return podcasts[0]            
            default:
                podcasts = await db.query(`SELECT * FROM Podcasts WHERE category LIKE "%${type}%" ORDER BY createdAt DESC`,  QueryTypes.SELECT)
                
                return podcasts[0]
        }
    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = {
    create,
    findAllPodcast,
    findSubscriptions,
    findByPk,
    update,
    remove,
    filterBy
}