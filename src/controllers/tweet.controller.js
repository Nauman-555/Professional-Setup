import mongoose from "mongoose";
import { asynchandler } from "../utilis/asynchandler";
import { ApiResponse } from "../utilis/ApiResponse";
import { ApiError } from "../utilis/ApiError";
import { Tweet } from "../models/tweet.model";

// Create Tweet
const CreateTweet = asynchandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || !userId) {
    throw new ApiError(400, "All fields are required");
  }

  const tweet = await new Tweet({
    content,
    user: userId,
  });
  const newTweet = await tweet.saved();
  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "Tweet uploaded succesfully"));
});

// update Tweet
const UpdateTweet = asynchandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    throw new ApiError(404, "content is required");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (tweet.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this");
  }
  tweet.content = content;

  const updatedtweet = await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedtweet, "tweet updated successfully"));
});

// Delete Tweet
const DeleteTweet = asynchandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (tweet.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this");
  }
  const deleteTweet = await tweet.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet deleted successfully"));
});

// Get User Tweets
const GetUserTweets = asynchandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  if (!userId) {
  }
  let match = { owner: mongoose.Types.ObjectId(userId) };

  const pipeline = [
    { $match: match },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit, 10) },
  ];

  const tweets = await Tweet.aggregate(pipeline);
  const totalCount = await Tweet.countDocuments(match);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tweets,
        count: totalCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      },
      "tweets fetched successfully"
    )
  );
});

export { CreateTweet, UpdateTweet, DeleteTweet, GetUserTweets };
