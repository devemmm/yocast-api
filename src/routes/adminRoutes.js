const { 
        createPodcastCont,
        getAllUserSubscription, 
        getAllUsers,
        updatePodcastCont, 
        deletePodcastCont 
    } = require('../controller/appController')
const express = require('express')

const router = express()

router
    .post('/admin/podcast', createPodcastCont)

    .get('/admin/subscription', getAllUserSubscription)

    .get('/admin/users', getAllUsers)

    .patch('/admin/podcast/:id', updatePodcastCont)

    .delete('/admin/podcast/:id', deletePodcastCont)

module.exports = router