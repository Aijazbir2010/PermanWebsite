import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import Episode from '../models/Episode.js'

const router = Router();

//Get all episodes
router.get('/:id', authenticate, async (req, res) => {
    try {
        const id = req.params.id
        const episode = await Episode.findOne({episodeId: id})
        res.json({episode})  
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Server Error ! Can't Fetch Episode !"})
    }
    
})

export default router;