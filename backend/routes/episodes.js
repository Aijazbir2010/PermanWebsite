import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import Episode from '../models/Episode.js'
import User from '../models/User.js';

const router = Router();

//Get all episodes
router.get('/', authenticate, async (req, res) => {
    try {
        const episodes = await Episode.find({})
        res.json({episodes})  
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Server Error ! Can't Fetch Episodes !"})
    }
    
})

//Like an Episode
router.post('/likeepisode', authenticate, async (req, res) => {
    try {
       const episodeId = req.query.id
        const updatedUser = await User.findOneAndUpdate({userId: req.user.userId}, {$addToSet: {likedEpisodes: episodeId}}, {new: true})
        const updatedEpisode = await Episode.findOneAndUpdate({episodeId}, {$inc: {likes: 1}}, {new: true})

        res.json({user: updatedUser, episode: updatedEpisode, message: "Episode Liked Successfully !"}) 
    } catch (err) {
        return res.status(500).json({message: "Failed To Like Episode ! Server Error !"})
    }

})

//Unlike an Episode
router.post('/unlikeepisode', authenticate, async (req, res) => {
    try {
       const episodeId = req.query.id
        const updatedUser = await User.findOneAndUpdate({userId: req.user.userId}, {$pull: {likedEpisodes: episodeId}}, {new: true})
        const updatedEpisode = await Episode.findOneAndUpdate({episodeId}, {$inc: {likes: -1}}, {new: true})

        res.json({user: updatedUser, episode: updatedEpisode, message: "Episode Unliked Successfully !"}) 
    } catch (err) {
        return res.status(500).json({message: "Failed To Unlike Episode ! Server Error !"})
    }

})

//Get Liked Episodes
router.get('/likedepisodes', authenticate, async (req, res) => {
    try {
        const userId = req.query.userid
        const user = await User.findOne({userId})
       
        if (!user) {
            return res.status(404).json({message: "User Not Found !"})
        }

        const likedEpisodesIds = user.likedEpisodes

        const episodes = await Episode.find({ episodeId: { $in: likedEpisodesIds } });

        const likedEpisodes = user.likedEpisodes.map((id) =>
          episodes.find((episode) => episode.episodeId === id)
        ).reverse()

        res.json({likedEpisodes});

    } catch (err) {
        return res.status(500).json({message: "Error Fetching Liked Eisodes ! Server Error !"})
    }
})

//Get Liked Episodes Length
router.get('/likedepisodes/length', authenticate, async (req, res) => {
    try {
        const user = await User.findOne({userId: req.user.userId})

        const length = user.likedEpisodes.length

        res.json({length})

    } catch (err) {
        return res.status(500).json({message: "Can't Get Length Of Liked Episodes ! Server Error !"})
    }
})

//Get Trending Episodes

// Utility function to get random episodes
const getRandomEpisodes = async (limit) => {
    return await Episode.aggregate([{ $sample: { size: limit } }]);
};

router.get('/trendingepisodes', authenticate, async (req, res) => {
    try {
      // Step 1: Get all episodes sorted by likes and comments
      const topEpisodes = await Episode.aggregate([
        {
          $addFields: {
            totalLikesAndComments: { $add: ["$likes", "$comments"] }  // Compute the total sum of likes and comments
          }
        },
        {
          $sort: {
            totalLikesAndComments: -1  // Sort by the total sum of likes and comments in descending order
          }
        },
        {
          $limit: 3  // Limit to only the top episode
        }
      ]);
  
      // Step 2: Check if we have enough episodes with likes and comments
      const episodesWithLikesAndComments = topEpisodes.filter(
        (episode) => episode.likes > 0 || episode.comments > 0
      );
  
      if (episodesWithLikesAndComments.length === 3) {

        // Case 1: If there are already 3 episodes with likes and comments, send them
        return res.json({ trendingEpisodes: topEpisodes });

      } else if (episodesWithLikesAndComments.length > 0) {

        // Case 2: If we have 1 or 2 episodes with likes/comments, fill the rest randomly
        const remainingCount = 3 - episodesWithLikesAndComments.length;
        const randomEpisodes = await getRandomEpisodes(remainingCount);
        const trendingEpisodes = [...episodesWithLikesAndComments, ...randomEpisodes];
        return res.json({ trendingEpisodes });

      } else {

        // Case 3: If no episode has likes/comments, send 3 random episodes
        const randomEpisodes = await getRandomEpisodes(3);
        return res.json({ trendingEpisodes: randomEpisodes });

      }
    } catch (err) {
      return res.status(500).json({message: "Can't Fetch Trending Episodes ! Server Error !"});
    }
});

// Get Trending Episode for Homepage
router.get('/trendingepisode', authenticate, async (req, res) => {
    try {
      // First, try to fetch the top episode sorted by likes and comments
      const topEpisode = await Episode.aggregate([
        {
          $addFields: {
            totalLikesAndComments: { $add: ["$likes", "$comments"] }  // Compute the total sum of likes and comments
          }
        },
        {
          $sort: {
            totalLikesAndComments: -1  // Sort by the total sum of likes and comments in descending order
          }
        },
        {
          $limit: 1  // Limit to only the top episode
        }
      ]);
  
      // If there is a top episode with likes or comments, return it
      if (topEpisode.length > 0 && (topEpisode[0].likes > 0 || topEpisode[0].comments > 0)) {
        return res.json({trendingEpisode: topEpisode[0]});
      }
  
      // If no episode has likes or comments, fetch a random episode
      const randomEpisode = await Episode.aggregate([
        { $sample: { size: 1 } } // Select a random episode
      ]);
  
      return res.json({trendingEpisode: randomEpisode[0]}); // Return the random episode
    } catch (err) {
      return res.status(500).json({message: "Can't Fetch Trending Episode ! Server Error !"});
    }
}); 

export default router;