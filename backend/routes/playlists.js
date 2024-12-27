import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import Playlist from '../models/Playlist.js';
import Episode from '../models/Episode.js'

const router = Router();

//Get All Playlists
router.get('/', authenticate, async (req, res) => {
    try {
        const { userId } = req.user

        const playlists = await Playlist.find({userId})

        res.json({playlists})
        
    } catch (err) {
        return res.status(500).json({message: "Can't Get Playlists ! Server Error !"})
    }
})

//Get a Playlist
router.get('/playlist', authenticate, async (req, res) => {
    try {
        const playlistId = req.query.id

        const playlist = await Playlist.findOne({playlistId, userId: req.user.userId})

        if (!playlist) {
            return res.status(404).json({message: "Not Found Playlist!"})
        }

        const episodes = await Episode.find({episodeId: {$in: playlist.episodes}})

        const playlistEpisodes = playlist.episodes.map((id) => 
            episodes.find((episode) => episode.episodeId === id)
        ).reverse()

        res.json({playlist, playlistEpisodes})

    } catch (err) {
        return res.status(500).json({message: "Can't Get Playlist ! Server Error !"})
    }
})

//Create a Playlist
router.post('/', authenticate, async (req, res) => {
    try {
        const { userId } = req.user
        const { name, description } = req.body

        const newPlaylist = await Playlist.create({userId, name, description})

        res.json({newPlaylist})

    } catch (err) {
        return res.status(500).json({message: "Can't Create Playlist ! Server Error !"})
    }
})

//Edit a Playlist
router.post('/edit', authenticate, async (req, res) => {
    try {
        const playlistId = req.query.id
        const { name, description } = req.body

        const updatedPlaylist = await Playlist.findOneAndUpdate({playlistId}, {name, description}, {new: true})

        res.json({updatedPlaylist})

    } catch (err) {
        return res.status(500).json({message: "Can't Edit Playlist ! Server Error !"})
    }
})

//Delete a Playlist
router.delete('/', authenticate, async (req, res) => {
    try {
        const playlistId = req.query.id
        const { userId } = req.user

        const deletedPlaylist = await Playlist.findOneAndDelete({playlistId})

        const playlists = await Playlist.find({userId})

        res.json({playlists})

    } catch (err) {
        return res.status(500).json({message: "Can't Delete Playlist ! Server Error !"})
    }
})


//Add Episodes in Playlist
router.post('/addepisodes', authenticate, async (req, res) => {
    try {
        const playlistId = req.query.id
        const { episodesToAdd } = req.body //Array of Id's of Episodes

        if (!Array.isArray(episodesToAdd)) {
            return res.status(400).json({ message: 'Episodes must be an Array.' });
        }

        if (episodesToAdd.length === 0) {
            return res.status(400).json({ message: 'No Episode Selected To Add !' });
        }

        const updatedPlaylist = await Playlist.findOneAndUpdate({playlistId}, {$addToSet: {episodes: {$each: episodesToAdd}}}, {new: true})

        res.json({updatedPlaylist})

    } catch (err) {
        return res.status(500).json({message: "Can't Add Episodes In Playlist ! Server Error !"})
    }
})

//Add Episode to Selected Playlists
router.post('/addepisodetoplaylists', authenticate, async (req, res) => {
    try {
        const episodeId = req.query.id
        const { addToPlaylists } = req.body //Array of Id's of Playlists

        if (!Array.isArray(addToPlaylists)) {
            return res.status(400).json({ message: 'Playlists must be an Array.' });
        }

        if (addToPlaylists.length === 0) {
            return res.status(400).json({ message: 'No Playlist Selected To Add In !' });
        }

        for (const playlist of addToPlaylists) {
            await Playlist.findOneAndUpdate({playlistId: playlist}, {$addToSet: {episodes: episodeId}})
        }

        const updatedPlaylists = await Playlist.find({userId: req.user.userId})

        res.json({updatedPlaylists})

    } catch (err) {
        return res.status(500).json({message: "Can't Add Episode To Playlists ! Server Error !"})
    }
})

//Remove Episode from Selected Playlists
router.post('/removeepisodefromplaylists', authenticate, async (req, res) => {
    try {
        const episodeId = req.query.id
        const { removeFromPlaylists } = req.body //Array of Id's of Playlists

        if (!Array.isArray(removeFromPlaylists)) {
            return res.status(400).json({ message: 'Playlists must be an Array.' });
        }

        if (removeFromPlaylists.length === 0) {
            return res.status(400).json({ message: 'No Playlist Selected To Add In !' });
        }

        for (const playlist of removeFromPlaylists) {
            await Playlist.findOneAndUpdate({playlistId: playlist}, {$pull: {episodes: episodeId}})
        }

        const updatedPlaylists = await Playlist.find({userId: req.user.userId})

        res.json({updatedPlaylists})

    } catch (err) {
        return res.status(500).json({message: "Can't Remove Episode From Playlists ! Server Error !"})
    }
})

export default router;
