import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
    userId: {type: String, default: uuidv4},
    displayname: {type: String},
    email: {type: String, required: true},
    username: {type: String, required: true},
    password: {type: String, required: true},
    profilePic: {type: String, default: "https://m.media-amazon.com/images/M/MV5BMmU0OWRhNmMtZGM2Ni00MGI0LTkyZDEtYWU1YjlhZjkyNDU2XkEyXkFqcGc@._V1_.jpg"},
    likedEpisodes: {type: Array, default: []},
    createdAt: {type: Date, default: Date.now},
    verificationCode: {type: String},
});

const User = mongoose.model('User', userSchema)
export default User;