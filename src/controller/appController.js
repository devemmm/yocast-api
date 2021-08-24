const multer = require('multer')
const { requireAuth } = require('../middleware/requireAuth')
const { signup, 
        signin,
        view,
        like,
        getAllPodcast,
        filterPodcast,
        paysubscription,
        findSubscription,
        updateAccount,
        signout 
    } = require('../services/userServices')

const { createPodcast, deletePodcast,updatePodcast } = require('../services/adminService')


const avatarStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/avatar')
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
})

const podcastStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/videos/podcasts')
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
})

const avatar = multer({
    storage: avatarStorage,
    limits: {
        fieldSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please Upload an Image File'))
        }

        cb(undefined, true)
    }
})


const podcastMedia = multer({
    storage: podcastStorage,
    limits: {
        fieldSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(MP4)$/)) {
            return cb(new Error('Please upload an mp4 media'))
        }

        cb(undefined, true)
    }
})


const index = [
    (req, res)=>{
        res.status(200).json({
            status: 200,
            message: 'hello'
        })
    }
]

const signinCont = [
    async(req, res)=>{
        const {email, password } = req.body
        try {
            if(!email){
                throw new Error("email required")
            }

            if(!password){
                throw new Error("password required")
            }
            const user = await signin(email, password)

            res.status(200).json({ statusCode: 200, status: "successfull", message: "you are logged in", user})
        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
        }
    }
]


const signupCont = [
    async(req, res)=>{

        try {
            const user = await signup({
                ...req.body
            })
    
            res.status(200).json({ statusCode: 201, message: 'account created successfull', status: 'successfull', user })                                                 
        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
        }
    }
]

const createPodcastCont = [
    requireAuth, podcastMedia.single("podcast"),async(req, res)=>{
        
        const pod = req.body
        pod.owner = req.user.email

        try {

            if(req.user.type !== "admin"){
                throw new Error("only admin allowed to add new podcast")
            }

            if(!req.file){
                throw new Error("Podcast media media must be required")
            }

            if(req.file){
                pod.url = (req.file.path).replace('public', `${process.env.SITE_URL}`)
            }

            const podcast = await createPodcast(pod)
            res.status(200).json({
                statusCode: 201,
                status: "sucessfull",
                message: "podcast created",
                podcast
            })
        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
        }
    },(error, req, res, next) => {
        res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
    }
]

const updatePodcastCont = [
    requireAuth, async(req, res)=>{
        try {

            if(req.user.type !== "admin"){
                throw new Error("only admin allowed to use this service")
            }
            let updates = req.body
            const allowedUpdates = ["name", "description", "category", "price"]

            const isValidUpdate = Object.keys(updates).every((update)=>allowedUpdates.includes(update))
            
            if(!isValidUpdate){
                throw new Error("internal server error it seems you have added undefined attributes for podcast or you want to modify unexpected attributes")
            }

            if(!req.params.id){
                throw new Error("podcast id must be required")
            }

            updates.id = req.params.id

            const podcast = await updatePodcast(updates)
            res.status(200).json({ statusCode: 200, status: "sucessfull", message: "podcast updated successfull",podcast})

        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
        }
    }
]

const deletePodcastCont = [
    requireAuth, async(req, res)=>{
        try {

            if(req.user.type !== "admin"){
                throw new Error("only admin allowed to use this service")
            }
            const id = parseInt(req.params.id)

            await deletePodcast(id)
            res.status(200).json({ statusCode: 200, message: 'delete podcast successfull', status: 'successfull'})                                                 
        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
        }
    }
]


const podcasts = [
    requireAuth, async(req, res)=>{

        try {
            const podcast = await getAllPodcast()

            res.status(200).json({ statusCode: 200, status: "sucessfull", podcast})
            
        } catch (error) {
            return res.status(500).json({ error: { statusCode: 500, status: "failed", message: error.message} })
        }
    }
]

const listernPodcast = [
    requireAuth, async(req, res)=>{
        try {
            let { podcast } = req.query

            podcast = parseInt(podcast)

            if(!podcast){
                throw new Error("wrong query string")
            }

            res.status(200).json({
                statusCode: 200,
                status: "sucessfull",
                podcast: await view(podcast)
            })
        } catch (error) {
            return res.status(404).json({ error: { statusCode: 404, status: "failed", message: error.message} })
        }
    }
]

const likePodcast = [
    requireAuth, async(req, res)=>{
        try {
            let { podcast } = req.query

            if(!podcast){
                throw new Error("wrong query string")
            }

            podcast = parseInt(podcast)

            res.status(200).json({
                statusCode: 200,
                status: "sucessfull",
                podcast: await like(podcast)
            })
        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
        }
    }
]

const filterPodcastCont = [
    requireAuth, async (req, res)=>{
        try {
            let { recent, category } = req.query

            if(!recent | !category){
                throw new Error("filter type must be required")
            }
            const podcast = await filterPodcast(String(category).toLowerCase())
            return res.status(200).json({statusCode: 200, status: 'successfull', message: 'filtered by recient', podcast})
        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
        }
    }
]

const paysubscriptionCont = [
    requireAuth, async(req, res)=>{
        try {
            const { email } = req.user
            const { type } = req.body

            if(!type){
                throw new Error("missing subscription type")
            }

            const subscription = await paysubscription(email, type)
            return res.status(200).json({statusCode: 200, status: 'successfull', message: 'buy subscription sucessfull', subscription})
        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
        }
    }
]

const findSubscriptionCont = [
    requireAuth, async(req, res)=>{
        try {
            const { email } = req.user
            const { type } = req.query

            if(!type){
                throw new Error("filter type must be required");
            }

            const subscription = await findSubscription(email, type)
            return res.status(200).json({statusCode: 200, status: 'successfull', message: 'subscription', subscription})
        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
        }
    }
]

const updateAccountCont = [
    requireAuth, avatar.single("avatar"), async(req, res)=>{
        try {

            const updates = req.body

            if(req.file){
                updates.avatar = (req.file.path).replace('public', `${process.env.SITE_URL}`)
            }
            
            
            const allowedUpdates = ["names", "country", "phone", "avatar"]
            const isValidOperation = Object.keys(updates).every((update)=>allowedUpdates.includes(update))

            if(!isValidOperation){
                throw new Error("internal server error it seems you have added undefined attributes for user or you want to modify unexpected attributes")
            }

            updates.email = req.user.email
            const user = await updateAccount(updates)

            return res.status(200).json({statusCode: 200, status: 'successfull', message: 'account updated successfull', user})
        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
        }
    }, (error, req, res, next) => {
        res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
    }
]

const signOutCont = [
    requireAuth, async(req, res)=>{
        try {
            const { all } = req.query
            
            let result = null

            if(!all){
                result = await signout(req.user.token)
            }

            if(all === "true"){
                result = await signout(req.user.token, "all")
            }

            if(result == null){
                throw new Error("wrong query string from url")
            }

            return res.status(200).json({statusCode: 200, status: 'successfull', message: 'signout done', result})

        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message} })
        }
    }
]

const notFound = [
    async(req, res)=>{
        return res.status(404).json({ error: { statusCode: 404, status: "failed", message: "router not found"} })
    }
]

module.exports = {
    index,
    signinCont,
    signupCont,
    podcasts,
    createPodcastCont,
    notFound,
    listernPodcast,
    likePodcast,
    filterPodcastCont,
    paysubscriptionCont,
    findSubscriptionCont,
    updateAccountCont,
    updatePodcastCont,
    deletePodcastCont,
    signOutCont
}