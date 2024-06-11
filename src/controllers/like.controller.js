import mongoose from "mongoose";
import { ApiError } from "../utilis/ApiError";
import { ApiResponse } from "../utilis/ApiResponse";
import { asynchandler } from "../utilis/asynchandler";
import { Like } from "../models/like.model";
import { Video } from "../models/video.model";
import { Comment } from "../models/comment.model";
import { Tweet } from "../models/tweet.model";
// Getting all the liked videos
const getLikedVideos = asynchandler(async (req, res) => {
  const { page = 1, limit = 10, userId } = req.query;

  if (!userId) {
    throw new ApiError(400, "User Id not found");
  }

  //    Create a pipeline
  const pipeline = [
    {
      $match: {
        likedby: mongoose.Types.ObjectId(userId),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit, 10),
    },
    {
      $project: {
        _id: 0,
        video: "$videoDetails",
      },
    },
  ];
  const likedVideos = await Like.aggregate(pipeline);

  const countPipeline = [
    {
      $match: {
        likedby: mongoose.Types.ObjectId(userId),
        video: { $exists: true },
      },
    },
    { $count: "totalcount" },
  ];
  const countResult = await Like.aggregate(countPipeline);
  const totalcount = countResult[0] ? countResult[0].totalcount : 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        videos: likedVideos,
        count: totalcount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      },
      "Liked Videos Fetched Successfully"
    )
  );
});

// Toggle video like
const toggleVideoLike = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(404, "User not found");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const LikedIndex = video.likes.Indexof(userId);
  if (LikedIndex !== -1) {
    video.likes.splice(LikedIndex, 1);
    await video.save();
    res.status(200).json({
      message: "video unliked successfully",
      likes: video.likes.length,
    });
  } else {
    video.likes.push(userId);
    await video.save();
    res
      .status(200)
      .json({ message: "video liked successfully", likes: video.likes.length });
  }
});

// Toggle comment like
const toggleCommentLike = asynchandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(404, "User not found");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  const LikedIndex = comment.likes.Indexof(userId);
  if (LikedIndex !== -1) {
    // it is liked, so unlike it!
    comment.likes.splice(LikedIndex, 1);
    await comment.save();
    res.status(200).json({
      message: "comment unliked successfully",
      likes: comment.likes.length,
    });
  } else {
    // disliking
    comment.likes.push(userId);
    await comment.save();
    res
      .status(200)
      .json({
        message: "comment liked successfully",
        likes: comment.likes.length,
      });
  }
});

// Toggle tweet like
const toggleTweetLike = asynchandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(404, "User not found");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }

  const LikedIndex = tweet.likes.Indexof(userId);
  if (LikedIndex !== -1) {
    // it is liked, so unlike it!
    tweet.likes.splice(LikedIndex, 1);
    await tweet.save();
    res.status(200).json({
      message: "tweet unliked successfully",
      likes: tweet.likes.length,
    });
  } else {
    // disliking
    tweet.likes.push(userId);
    await tweet.save();
    res
      .status(200)
      .json({ message: "tweet liked successfully", likes: tweet.likes.length });
  }
});
export { getLikedVideos, toggleVideoLike, toggleCommentLike, toggleTweetLike };
