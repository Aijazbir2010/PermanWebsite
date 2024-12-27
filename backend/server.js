import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import EpisodesRouter from './routes/episodes.js'
import PlayEpisodeRouter from './routes/playepisode.js'
import SearchRouter from './routes/search.js'
import UserRouter from './routes/user.js'
import CommentsRouter from './routes/comments.js'
import ReviewsRouter from './routes/reviews.js'
import PlaylistsRouter from './routes/playlists.js'

import User from './models/User.js';

dotenv.config({ path: '.env.local' });

const app = express();
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const PORT = 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' , credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/episodes', EpisodesRouter)
app.use('/playepisode', PlayEpisodeRouter)
app.use('/search', SearchRouter)
app.use('/user', UserRouter)
app.use('/comments', CommentsRouter)
app.use('/reviews', ReviewsRouter)
app.use('/playlists', PlaylistsRouter)

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/perman', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Generate Tokens
const generateAccessToken = (user) => {
    return jwt.sign({email: user.email, userId: user.userId}, JWT_ACCESS_SECRET, {expiresIn: '1h'})
};

const generateRefreshToken = (user) => {
    return jwt.sign({email: user.email, userId: user.userId}, JWT_REFRESH_SECRET, {expiresIn: '7d'})
};

app.get('/', (req, res) => {
    res.send("Hello World...")
})

// Signup and Authenticate
app.post('/signup', async (req, res)=>{
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({message: "All fields are required !"});
    };

    try {

        //Check if a User with the Same Username Already Exists
        const existingUserWithUsername = await User.findOne({username})

        if (existingUserWithUsername) {
            return res.status(409).json({message: "User with this Username Already Exists !"})
        }

        //Check if a User with the Same E-mail Already Exists
        const existingUserWithEmail =  await User.findOne({email})
        
        if (existingUserWithEmail) {
            return res.status(409).json({message: "User with this E-mail Already Exists !"})
        }
        
        //Hash Password
        const hashedPassword = await bcrypt.hash(password, 10)

        //Create the new User
        const newUser = await User.create({email, username, password: hashedPassword});

        //Generate Tokens
        const accessToken = generateAccessToken(newUser)
        const refreshToken = generateRefreshToken(newUser)

        res.cookie('refreshToken', refreshToken, {httpOnly: true}).json({accessToken});
    } catch (err) {
        res.status(400).json({message: "Server Error ! Please try again later !"});
    }
});

//Login
app.post('/login', async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({message: "All fields are required !"})
    }

    try {
        const user = await User.findOne({$or: [{email: identifier}, {username: identifier}]})

        if (!user) {
            return res.status(401).json({message: "Invalid e-mail/username !"})
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({message: "Invalid password !"})
        }

        //Generate Tokens
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        res.cookie('refreshToken', refreshToken, {httpOnly: true}).json({accessToken});
    } catch (err) {
        res.status(400).json({message: "Server Error ! Please try again later !"})
    }
});

//Refresh Token Endpoint 
app.post('/refresh', (req, res) => {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
        return res.status(401).json({message: "Refresh Cookies Missing !"})
    }

    try {
        const user = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const newAccessToken = generateAccessToken(user)
        res.json({accessToken: newAccessToken});
    } catch (err) {
        res.status(403).clearCookie('refreshToken').json({message: "Invalid or Expired Refresh Token !"})
    }
});

//Signout
app.post('/signout', (req, res) => {
    res.clearCookie('refreshToken').json({message: "Logged out Successfully !"})
});


app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`)
})