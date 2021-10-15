const Podcast = require('../models/Podcast')
const { create, update,remove, findByPk } = require('../dataAcessObject/appDao')

const createPodcast = async(pod)=>{
    try {

        let { owner, owner_names, name, description, price, category, url } = pod

        
        if(!name){
            throw new Error("podcast name must be required")
        }

        if(!description){
            throw new Error("podcast description must be required")
        }

        if(!price){
            throw new Error("podcast price must be required")
        }

        price = parseInt(price)

        if(!category){
            throw new Error("podcast category must be required")
        }

        if(!url){
            throw new Error("podcast media must be required")
        }

        const podcast = new Podcast({
            owner,
            owner_names,
            name,
            description,
            price,
            category,
            url
        }).dataValues

        return await create(podcast, 'podcast')
    } catch (error) {
        throw new Error(error.message)
    }
}

const updatePodcast = async(updates)=>{
    try {
        const allowedUpdates = ["id", "name", "description", "category", "price"]

        const isValidUpdate = Object.keys(updates).every((update)=>allowedUpdates.includes(update))
        
        if(!isValidUpdate){
            throw new Error("internal server error it seems you have added undefined attributes for podcast or you want to modify unexpected attributes")
        }

        const podcastDetails = await findByPk(updates.id, "podcast")
        
        const podcast = new Podcast({
            ...podcastDetails._previousDataValues,
            ...updates
        }).dataValues

        return await update(podcast, 'podcast')
    } catch (error) {
        throw new Error(error.message)
    }
}

const deletePodcast = async(podcastId)=>{
    try {
        return await remove(podcastId, "podcast")
    } catch (error) {
        throw new Error(error.message)
    }
}


module.exports = {
    createPodcast,
    deletePodcast,
    updatePodcast
}