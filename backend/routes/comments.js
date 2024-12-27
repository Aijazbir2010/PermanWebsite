import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import Episode from '../models/Episode.js'
import User from '../models/User.js';
import Comment from '../models/Comment.js';

const router = Router();

//Get all comments of an EPisode by Episode Id
router.get('/', authenticate,  async (req, res) => {
    try {
        const episodeId = req.query.id
        const userId = req.user.userId

        const comments = await Comment.find({episodeId})
        const userComments = await Comment.find({userId})

        res.json({comments, userComments})
    } catch (err) {
        return res.status(500).json({message: "Error Fetching Comments ! Server Error !"})
    }
})

//Post a Comment
router.post('/', authenticate, async (req, res) => {
    try {
        const episodeId = req.query.id
        const userId = req.user.userId
        const { content } = req.body

        const user = await User.findOne({userId})
        const newComment = await Comment.create({episodeId, userId, content, userDisplayName: user.displayname || user.username, userUsername: user.username, userProfilePic: user.profilePic})

        const updatedEpisode = await Episode.findOneAndUpdate({episodeId}, {$inc: {comments: 1}}, {new: true})

        res.json({newComment, updatedEpisode, message: "Comment Posted Successfully !"})

    } catch (err) {
        return res.status(500).json({message: "Can't Post Comment ! Server Error !"})
    }
})

//Delete Comment
router.delete('/', authenticate, async (req, res) => {
    try {
        const commentId = req.query.id

        const comment = await Comment.findOne({commentId})

        const deletedComment = await Comment.findOneAndDelete({commentId})
        const updatedEpisode = await Episode.findOneAndUpdate({episodeId: comment.episodeId}, {$inc: {comments: -1}}, {new: true})
        const comments = await Comment.find({episodeId: comment.episodeId})
        const userComments = await Comment.find({userId: req.user.userId})

        res.json({updatedEpisode, comments, userComments, message: "Comment Deleted Successfully !"})
    } catch (err) {
        return res.status(500).json({message: "Can't Delete Comment ! Server Error !"})
    }
})

//Edit Comment
router.post('/edit', authenticate, async (req, res) => {
    try {
        const commentId = req.query.id
        const { content } = req.body

        const comment = await Comment.findOne({commentId})

        const updatedComment = await Comment.findOneAndUpdate({commentId}, {content, $inc: {editedCount: 1}}, {new: true})
        const comments = await Comment.find({episodeId: comment.episodeId})

        res.json({comments, message: "Comment Edited Successfully !"})
    } catch (err) {
        return res.status(500).json({message: "Can't Edit Comment ! Server Error !"})
    }
})

export default router;