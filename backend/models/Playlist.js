import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const PlaylistSchema = new mongoose.Schema({
    playlistId: {type: String, default: uuidv4},
    userId: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    episodes: {type: Array, default: []},
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);
export default Playlist;