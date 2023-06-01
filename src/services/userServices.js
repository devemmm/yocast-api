const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Subscription = require('../models/Subscription')
const User = require('../models/User')


const {
    create,
    remove,
    findByPk,
    findAllUsers,
    createOTP,
    findAllPodcast,
    update,
    filterBy,
    findSubscriptions,
} = require('../dataAcessObject/appDao')

const {
    generateToken,
    isExistUser,
    findByCredentials
} = require('./helpService')


/**
 * @description signup
 * @param { object } user
 * @returns string "successfull message"
 */
const signup = async (userDetails) => {
    try {
        const { email, names, country, password } = userDetails
        if (!email) {
            throw new Error("email required")
        }

        if (!names) {
            throw new Error("names required")
        }

        if (!country) {
            throw new Error("country required")
        }

        if (!password) {
            throw new Error("password required")
        }

        const user = new User({
            ...{
                email,
                names,
                country,
                password: await bcrypt.hash(password, 8)
            }
        }).dataValues

        if (await isExistUser(email)) {
            throw new Error("user alredy exist")
        }

        await create(user, 'user');
        const token = await generateToken(email, names)
        user.token = token;

        return user
    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * @description signin
 * @param { email, password }
 * @returns {object } user details
 */
const signin = async (email, password) => {
    try {
        const user = await findByCredentials(email, password)
        const token = await generateToken(email, user.names)

        user.token = token
        return user
    } catch (error) {
        throw new Error(error.message)
    }
}



const sendMail = async ({ names, email, phone, message }) => {
    const output = `
            <p>Yocast - Client Message</p>
            <h3>Client Details</h3>
            <ul>
                <li>Name: ${names}</li>
                <li>Email: ${email}</li>
                <li>Phone: ${phone}</li>
            </ul>
            <h3>Message</h3>
            <p>${message}</p>
        `;


    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        service: process.env.EMAIL_SERVICE,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: process.env.TECHNICAL_SUPPORT_MAILS,
        subject: "Yocast Ltd Custom Message",
        text: "heading",
        html: output
    });
}

/**
 * @description forgot password (account) details
 * @requires authorisaztion
 * @returns object
 */

const forgotPassword = async (email, phone) => {
    try {

        const user = await findByPk(email, 'user');

        if (!user) {
            throw new Error("email not found");
        }

        let OTP = Math.floor(Math.random() * 9999);
        OTP < 1000 ? OTP = OTP + 1000 : OTP = OTP;

        const secureOTP = jwt.sign({ OTP, email }, process.env.JWT_SECRET, { expiresIn: '15min' });

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            service: process.env.EMAIL_SERVICE,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: `Yocast verfication OTP code: ${OTP}`,
            text: 'this OTM will be expired in 10 min'
        });

        const result = await createOTP({ email, OTP: secureOTP, optType: 'otpCode' })
        if (result.statusCode === 200) {
            return secureOTP;
        }

        throw new Error("Something went wrong");
    } catch (error) {
        throw new Error(error.message)
    }
}


/**
 * @description get user(account) details
 * @requires authorisaztion
 * @returns object
 */

const getUserDetails = async ({ email, type }) => {
    try {

        if (!email && !type) {
            throw new Error("email must be required")
        }
        if (type === "all") {
            return await findAllUsers();
        }
        return await findByPk(email, 'user')
    } catch (error) {
        throw new Error(error.message)
    }
}


/**
 * @description find all podcasr podcast)
 * @requires authorisaztion
 * @returns { array list } podcast
 */
const getAllPodcast = async () => {
    const podcasts = await findAllPodcast()
    return podcasts
}



/**
 * @description find podcast by {category, recent, trending, likes}
 * @requires (query string with type)
 * @returns (podcasts)
 */
const filterPodcast = async (type) => {
    try {
        return await filterBy(type);
    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * @description view =podcast controller
 * @requires podcast id
 * @returns { object } podcast
 */
const view = async (podcastId) => {
    try {

        if (!podcastId) {
            throw new Error("podcast id must be required")
        }

        return await update(podcastId, 'views')
    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * @description like podcast
 * @requires podcast id
 * @returns { object } podcast
 */

const like = async (podcastId) => {
    try {

        if (!podcastId) {
            throw new Error("podcast id must be required")
        }

        return await update(podcastId, 'likes')
    } catch (error) {
        throw new Error("error.message")
    }
}

/**
 * @description(pay subscription)
 * @requires (email, type)
 * @returns (message, substription details)
 */
const paysubscription = async (email, transactionId, paymentMode, type, price, paymentStatus, currency) => {
    try {

        let desactivationDate = new Date();

        switch (type) {
            case 'monthly':
                desactivationDate.setDate(new Date().getDate() + 30);
                break
            default:
                desactivationDate = new Date();
                break;
        }

        const subscription = new Subscription({
            ...{
                owner: email,
                type,
                transactionId,
                paymentMode,
                price,
                currency,
                paymentStatus,
                desactivationDate
            }
        }).dataValues

        return await create(subscription, "subscription")

    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * @description(check subscription)
 * @requires(email, type)
 * @returns(subsription details)
 */
const findSubscription = async (email, type) => {
    try {

        if (!email || !type) {
            throw new Error("missing required parameters")
        }
        let subscriptions = []
        switch (type) {
            case 'history':
                return await findSubscriptions({ email })
            case 'last':
                subscriptions = await findSubscriptions({ email })
                return subscriptions[0]
            case 'all':
                subscriptions = await findSubscriptions({ type: 'all' })
                return subscriptions[0];
            default:
                return [];
        }

    } catch (error) {
        throw new Error(error.message)
    }
}

/**
 * @description (modify account)
 * @requires(account)
 * @returns (account)
 */

const updateAccount = async (updates) => {
    try {

        const allowedUpdates = ["email", "names", "country", "phone", "avatar"]
        const isValidOperation = Object.keys(updates).every((update) => allowedUpdates.includes(update))

        if (!isValidOperation) {
            throw new Error("internal server error it seems you have added undefined attributes for user or you want to modify unexpected attributes")
        }
        const account = await findByPk(updates.email, 'user')

        const user = new User({
            ...account._previousDataValues,
            ...updates
        }).dataValues

        return await update(user, 'user')
    } catch (error) {
        throw new Error(error.message)
    }
}

const signout = async (token, kind) => {
    try {
        if (!kind) {
            return await remove(token, 'token')
        }

        return await remove(token, 'token', "all")
    } catch (error) {
        throw new Error(error.message)
    }
}

const handleMomoCallBack = async ({ transactionId, price, status }) => {
    try {
        const subsccription = await Subscription.findOne({ where: { transactionId } })
        if ( subsccription && subsccription.price === price && subsccription.paymentMode === "mobile money" && subsccription.paymentStatus === "PENDING") {
            subsccription.price = price;
            subsccription.paymentStatus = status

            return await subsccription.save();
        }

        throw new Error('wrong transaction id or you are trying to update the updated transaction')
    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = {
    signup,
    signin,
    forgotPassword,
    getUserDetails,
    getAllPodcast,
    sendMail,
    view,
    like,
    filterPodcast,
    paysubscription,
    findSubscription,
    updateAccount,
    signout,
    handleMomoCallBack
}