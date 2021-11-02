const express = require('express')
const router = express.Router()

const {
        signupCont,
        signinCont,
        forgotPasswordCont,
        verifyOTP,
        resetPasswordCont,
        podcasts,
        listernPodcast,
        likePodcast,
        notFound,
        filterPodcastCont,
        paysubscriptionCont,
        findSubscriptionCont,
        getAccountInfoCont,
        updateAccountCont,
        signOutCont
    } = require('../controller/appController')

router
    .post('/signup', signupCont)

    .post('/signin', signinCont)

    .post('/users/forgotpassword', forgotPasswordCont)

    .get('/users/check/otp/:email/:type/:otp', verifyOTP)

    .post('/users/reset/password', resetPasswordCont)

    .post('/user/listern', listernPodcast)

    .post('/user/podcast', likePodcast)

    .get('/user/podcast', filterPodcastCont)

    .get('/podcasts', podcasts)

    .post('/user/subscription', paysubscriptionCont)

    .get('/user/subscription', findSubscriptionCont)

    .get('/user/account/me', getAccountInfoCont)

    .patch('/user/account', updateAccountCont)

    .post('/user/signout', signOutCont)

    .get('/*', notFound)

    .post('/*', notFound)

module.exports = router
