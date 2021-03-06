const User = require('../models/User');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/requireAuth')
const { signup,
    signin,
    forgotPassword,
    getUserDetails,
    view,
    like,
    getAllPodcast,
    filterPodcast,
    paysubscription,
    findSubscription,
    updateAccount,
    signout
} = require('../services/userServices')

const { createPodcast, deletePodcast, updatePodcast } = require('../services/adminService')


const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/avatar')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
})



const podcastStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/videos/podcasts')
    },
    filename: function (req, file, cb) {
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

// const podcastCover = multer({
//     storage: podcastCoverStorage,
//     limits: {
//         fieldSize: 2000000
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//             return cb(new Error('Please Upload an Image File'))
//         }

//         cb(undefined, true)
//     }
// })


const podcastMedia = multer({
    storage: podcastStorage,
    limits: {
        fieldSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(MP3|mp3)$/)) {
            return cb(new Error('Please upload an mp4 media'))
        }

        cb(undefined, true)
    }
})

const signinCont = [
    async (req, res) => {
        const { email, password } = req.body
        try {
            if (!email) {
                throw new Error("email required")
            }

            if (!password) {
                throw new Error("password required")
            }
            const user = await signin(email, password)

            res.status(200).json({ statusCode: 200, status: "successfull", message: "you are logged in", user })
        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]


const signupCont = [
    async (req, res) => {

        try {
            const user = await signup({
                ...req.body
            })

            res.status(200).json({ statusCode: 201, message: 'account created successfull', status: 'successfull', user })
        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]

const forgotPasswordCont = [
    async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                throw new Error("you must provide email address")
            }

            const OTP = await forgotPassword(email, '');

            res.status(200).json({ statusCode: 200, message: 'check confirmation code your email', status: 'successfull', OTP })
        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]

const verifyOTP = [
    async (req, res) => {
        try {
            const { email, type, otp } = req.params;

            const userData = await User.findByPk(email);
            const user = userData.dataValues;

            if (!user) {
                throw new Error("user not found");
            }

            if (type === 'otpCode') {
                jwt.verify(user.otpCode, process.env.JWT_SECRET, async (error, payload) => {
                    try {
                        if (error) {
                            throw new Error("invalid OTP or it's expired")
                        }

                        if (parseInt(otp) !== payload.OTP) {
                            throw new Error("invalid OTP");
                        }

                        res.status(200).json({ statusCode: 200, message: 'valid OTP', status: 'successfull', OTP: payload.OTP })
                    } catch (error) {
                        return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
                    }
                })
            } else {
                res.status(400).json({ error: { statusCode: 400, status: "failed", message: 'system under development' } })
            }
        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]

const resetPasswordCont = [
    async (req, res) => {
        try {
            const { email, password, OTP } = req.body;

            const userData = await User.findByPk(email);
            const user = userData.dataValues;

            if (!user) {
                throw new Error("user not found");
            }

            jwt.verify(user.otpCode, process.env.JWT_SECRET, async (error, payload) => {
                try {
                    if (error) {
                        throw new Error("invalid OTP or it's expired")
                    }

                    if (parseInt(OTP) !== payload.OTP) {
                        throw new Error("invalid OTP");
                    }

                    userData.password = await bcrypt.hash(password, 8);

                    await userData.save();

                    res.status(200).json({ statusCode: 200, message: 'Password was Resetted successfully', status: 'successfull' })
                } catch (error) {
                    return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
                }
            });

        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]

const podcastst = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/podcasts')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
})

var uploadd = multer({storage: podcastst});

const multipleUpload = uploadd.fields([{name: 'podcast', maxCount: 1}, {name: 'cover', maxCount: 1}])

const createPodcastCont = [
    requireAuth, multipleUpload, async (req, res) => {

        const pod = req.body
        pod.owner = req.user.email
        pod.owner_names = req.user.names

        try {
            if (req.user.type !== "admin") {
                throw new Error("only admin allowed to add new podcast")
            }

            if (!req.files) {
                throw new Error("Podcast media media must be required")
            }

            if (req.files) {
                pod.cover = (req.files.cover[0].path).replace('public', `${process.env.SITE_URL}`)
                pod.url = (req.files.podcast[0].path).replace('public', `${process.env.SITE_URL}`)
            }

            const podcast = await createPodcast(pod)
            res.status(200).json({
                statusCode: 201,
                status: "sucessfull",
                message: "podcast created",
                podcast
            })
        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }, (error, req, res, next) => {
        res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
    }
]

const getAccountInfoCont = [
    requireAuth, async (req, res) => {
        try {
            const user = await getUserDetails(req.user.email)

            res.status(200).json({ statusCode: 200, status: "sucessfull", message: "user details", user })
        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]

const updatePodcastCont = [
    requireAuth, async (req, res) => {
        try {

            if (req.user.type !== "admin") {
                throw new Error("only admin allowed to use this service")
            }
            let updates = req.body
            const allowedUpdates = ["name", "description", "category", "price"]

            const isValidUpdate = Object.keys(updates).every((update) => allowedUpdates.includes(update))

            if (!isValidUpdate) {
                throw new Error("internal server error it seems you have added undefined attributes for podcast or you want to modify unexpected attributes")
            }

            if (!req.params.id) {
                throw new Error("podcast id must be required")
            }

            updates.id = req.params.id

            const podcast = await updatePodcast(updates)
            res.status(200).json({ statusCode: 200, status: "sucessfull", message: "podcast updated successfull", podcast })

        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]

const deletePodcastCont = [
    requireAuth, async (req, res) => {
        try {

            if (req.user.type !== "admin") {
                throw new Error("only admin allowed to use this service")
            }
            const id = parseInt(req.params.id)

            await deletePodcast(id)
            res.status(200).json({ statusCode: 200, message: 'delete podcast successfull', status: 'successfull' })
        } catch (error) {
            res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]


const podcasts = [
    requireAuth, async (req, res) => {

        try {
            const podcast = await getAllPodcast()

            res.status(200).json({ statusCode: 200, status: "sucessfull", podcast })

        } catch (error) {
            return res.status(500).json({ error: { statusCode: 500, status: "failed", message: error.message } })
        }
    }
]

const listernPodcast = [
    requireAuth, async (req, res) => {
        try {
            let { podcast } = req.query

            podcast = parseInt(podcast)

            if (!podcast) {
                throw new Error("wrong query string")
            }

            res.status(200).json({
                statusCode: 200,
                status: "sucessfull",
                podcast: await view(podcast)
            })
        } catch (error) {
            return res.status(404).json({ error: { statusCode: 404, status: "failed", message: error.message } })
        }
    }
]

const likePodcast = [
    requireAuth, async (req, res) => {
        try {
            let { podcast } = req.query

            if (!podcast) {
                throw new Error("wrong query string")
            }

            podcast = parseInt(podcast)

            res.status(200).json({
                statusCode: 200,
                status: "sucessfull",
                podcast: await like(podcast)
            })
        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]

const filterPodcastCont = [
    requireAuth, async (req, res) => {
        try {
            let { recent, category } = req.query

            if (!recent | !category) {
                throw new Error("filter type must be required")
            }
            const podcast = await filterPodcast(String(category).toLowerCase())
            return res.status(200).json({ statusCode: 200, status: 'successfull', message: 'filtered by recient', podcast })
        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]

const paysubscriptionCont = [
    requireAuth, async (req, res) => {
        try {
            const { email } = req.user
            const { transactionId, paymentMode, type, price, currency } = req.body

            if (!transactionId || !paymentMode || !type || !price || !currency) {
                throw new Error("missing required information")
            }

            const subscription = await paysubscription(email, transactionId, paymentMode, type, price, currency)
            return res.status(200).json({ statusCode: 200, status: 'successfull', message: 'buy subscription sucessfull', subscription })
        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]

const findSubscriptionCont = [
    requireAuth, async (req, res) => {
        try {
            const { email } = req.user
            const { type } = req.query

            if (!type) {
                throw new Error("filter type must be required");
            }

            const subscription = await findSubscription(email, type)
            return res.status(200).json({ statusCode: 200, status: 'successfull', message: 'subscription', subscription })
        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]

const updateAccountCont = [
    requireAuth, avatar.single("avatar"), async (req, res) => {
        try {

            const updates = req.body

            if (req.file) {
                updates.avatar = (req.file.path).replace('public', `${process.env.SITE_URL}`)
            }


            const allowedUpdates = ["names", "country", "phone", "avatar"]
            const isValidOperation = Object.keys(updates).every((update) => allowedUpdates.includes(update))

            if (!isValidOperation) {
                throw new Error("internal server error it seems you have added undefined attributes for user or you want to modify unexpected attributes")
            }

            updates.email = req.user.email
            const user = await updateAccount(updates)

            return res.status(200).json({ statusCode: 200, status: 'successfull', message: 'account updated successfull', user })
        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }, (error, req, res, next) => {
        res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
    }
]

const signOutCont = [
    requireAuth, async (req, res) => {
        try {
            const { all } = req.query

            let result = null

            if (!all) {
                result = await signout(req.user.token)
            }

            if (all === "true") {
                result = await signout(req.user.token, "all")
            }

            if (result == null) {
                throw new Error("wrong query string from url")
            }

            return res.status(200).json({ statusCode: 200, status: 'successfull', message: 'signout done', result })

        } catch (error) {
            return res.status(400).json({ error: { statusCode: 400, status: "failed", message: error.message } })
        }
    }
]

const notFound = [
    async (req, res) => {
        return res.status(404).json({ error: { statusCode: 404, status: "failed", message: "router not found" } })
    }
]

module.exports = {
    signinCont,
    signupCont,
    forgotPasswordCont,
    verifyOTP,
    resetPasswordCont,
    podcasts,
    createPodcastCont,
    notFound,
    listernPodcast,
    likePodcast,
    filterPodcastCont,
    paysubscriptionCont,
    findSubscriptionCont,
    getAccountInfoCont,
    updateAccountCont,
    updatePodcastCont,
    deletePodcastCont,
    signOutCont
}
