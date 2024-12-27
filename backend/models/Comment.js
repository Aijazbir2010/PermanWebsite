import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const CommentSchema = new mongoose.Schema({
    commentId: {type: String, default: uuidv4},
    episodeId: {type: String, required: true},
    userId: {type: String, required: true},
    content: {type: String, required: true},
    editedCount: {type: Number, default: 0},
    userDisplayName: {type: String, required: true},
    userUsername: {type: String, required: true},
    userProfilePic: {type: String, required: true},
});

const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;