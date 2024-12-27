import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const EpisodeSchema = new mongoose.Schema({
    episodeId: {type: String, default: uuidv4},
    name: {type: String, required: true},
    episodeNumber: {type: Number, required: true},
    duration: {type: String, required: true},
    likes: {type: Number, default: 0},
    comments: {type: Number, default: 0},
    episodeDriveLink: {type: String, default: 0},
});

const Episode = mongoose.model('Episode', EpisodeSchema);
export default Episode;