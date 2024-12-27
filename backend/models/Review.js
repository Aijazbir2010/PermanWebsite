import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ReviewSchema = new mongoose.Schema({
    reviewId: {type: String, default: uuidv4},
    userId: {type: String, required: true},
    content: {type: String, required: true},
    rating: {type: Number, required: true},
    likes: {type: Number, default: 0},
    likedByUsers: {type: Array, default: []},
    userDisplayName: {type: String, required: true},
    userUsername: {type: String, required: true},
    userProfilePic: {type: String, required: true},
});

const Review = mongoose.model('Review', ReviewSchema);
export default Review;