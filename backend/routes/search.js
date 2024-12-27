import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import Episode from '../models/Episode.js'

const router = Router();

router.get('/', authenticate,  async (req, res) => {
    try {
        const query = req.query.episode?.toLowerCase().trim()

        const episodes = await Episode.find({})

        const filteredEpisodes = episodes.filter((item) => (item.name).toLowerCase().includes(query))

        res.json({filteredEpisodes}) 
    } catch (err) {
        return res.status(500).json({message: "Server Error ! Can't Fetch Search Results !"})
    }

})

export default router;
