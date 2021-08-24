const express = require('express')
const router = express.Router()

const { index, 
        signupCont, 
        signinCont, 
        podcasts,
        listernPodcast,
        likePodcast,
        notFound,
        filterPodcastCont,
        paysubscriptionCont,
        findSubscriptionCont,
        updateAccountCont,
        signOutCont
    } = require('../controller/appController')

router

    .get('/', index)

    .post('/signup', signupCont)

    .post('/signin', signinCont)

    .post('/user/listern', listernPodcast)

    .post('/user/podcast', likePodcast)

    .get('/user/podcast', filterPodcastCont)

    .get('/podcasts', podcasts)

    .post('/user/subscription', paysubscriptionCont)

    .get('/user/subscription', findSubscriptionCont)

    .patch('/user/account', updateAccountCont)

    .post('/user/signout', signOutCont)

    .get('/*', notFound)

    .post('/*', notFound)

module.exports = router