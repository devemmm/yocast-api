const { 
        createPodcastCont, 
        updatePodcastCont, 
        deletePodcastCont 
    } = require('../controller/appController')
const express = require('express')

const router = express()

router
    .post('/admin/podcast', createPodcastCont)

    .patch('/admin/podcast/:id', updatePodcastCont)

    .delete('/admin/podcast/:id', deletePodcastCont)

module.exports = router