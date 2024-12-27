import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import User from '../models/User.js';
import Review from '../models/Review.js'

const router = Router();

//Get all Reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find({}).sort({likes: -1})

        res.json({reviews})

    } catch (err) {
        return res.status(500).json({message: "Can't Fetch Reviews ! Server Error !"})
    }
})

//Get User Review
router.get('/userreview', authenticate, async (req, res) => {
    try {
        const userReview = await Review.findOne({userId: req.user.userId})

        if (!userReview) {
            return res.json({message: "No User Review !"})
        }

        res.json({userReview})

    } catch (err) {
        return res.status(500).json({message: "Can't Fetch User Review ! Server Error !"})
    }
})

//Post a Review
router.post('/', authenticate, async (req, res) => {
    try {
        const { userId } = req.user
        const { rating, content } = req.body

        const validatedRating = Math.max(1, rating) //If rating is 0, 1 would be returned

        const user = await User.findOne({userId})

        const newReview = await Review.create({userId, content, rating: validatedRating, userDisplayName: user.displayname, userUsername: user.username, userProfilePic: user.profilePic})

        res.json({newReview, message: "Review Successfully Posted !"})

    } catch (err) {
        return res.status(500).json({message: "Can't Post Review ! Server Error !"})
    }
})

//Get Average Reviews of Site
router.get('/average', async (req, res) => {
    try {
        const reviews = await Review.find({})

        // If no reviews exist, return 0 as the average rating
        if (reviews.length === 0) {
            return res.json({ averageRating: 0, message: "No reviews available." });
        }

        // Calculate total rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

        // Calculate average rating
        const averageRating = Math.round(totalRating / reviews.length);

        // Return the average rating
        res.json({averageRating});

    } catch (err) {
        return res.status(500).json({message: "Can't Get Average Review Of Site ! Server Error !"})
    }
})

//Edit a Review
router.post('/edit', authenticate, async (req, res) => {
    try {
        const { userId } = req.user
        const { content, rating } = req.body

        const updatedReview = await Review.findOneAndUpdate({userId}, {content, rating}, {new: true})

        res.json({updatedReview})

    } catch (err) {
        return res.status(500).json({message: "Can't Edit Review ! Server Error !"})
    }
})

//Delete a Review
router.delete('/', authenticate, async (req, res) => {
    try {
        const { userId } = req.user

        const deletedReview = await Review.findOneAndDelete({userId})

        res.json({deletedReview})
    } catch (err) {
        return res.status(500).json({message: "Can't Delete Review ! Server Error !"})
    }
})

router.post('/like', authenticate, async (req, res) => {
    try {
        const reviewId = req.query.id

        const updatedReview = await Review.findOneAndUpdate({reviewId}, {$inc: {likes: 1}, $addToSet: {likedByUsers: req.user.userId}}, {new: true})

        res.json({updatedReview})

    } catch (err) {
        return res.status(500).json({message: "Can't Like Review ! Server Error !"})
    }
})

router.post('/unlike', authenticate, async (req, res) => {
    try {
        const reviewId = req.query.id

        const updatedReview = await Review.findOneAndUpdate({reviewId}, {$inc: {likes: -1}, $pull: {likedByUsers: req.user.userId}}, {new: true})

        res.json({updatedReview})

    } catch (err) {
        return res.status(500).json({message: "Can't Unlike Review ! Server Error !"})
    }
})

export default router