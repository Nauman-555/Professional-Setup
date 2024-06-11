import { asynchandler } from "../utilis/asynchandler.js";
import { ApiError } from "../utilis/ApiError.js";
import { Video } from "../models/video.model.js";
import { UploadOnCloudinary } from "../utilis/Cloudinary.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import fs from "fs";
import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";

// get video comments
const getVideoComments = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const skip = (page - 1) * limit;
  const comment = await Comment.find({ video: videoId })
    .populate("user", "username")
    .skip(skip)
    .limit(limit);

  if (!comment || comment.length === 0) {
    throw new ApiError(400, "comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, comment, "Comments fetched successfully"));
});

// add a comment
const AddComment = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!videoId || !content || !userId) {
    throw new ApiError(400, "all fields are required");
  }
  const newComment = new Comment({
    content,
    video: videoId,
    user: userId,
  });

  const savedComment = await newComment.saved();

  return res
    .status(201)
    .json(new ApiResponse(201, savedComment, "new comment added"));
});

// Update a Comment
const updateComment = asynchandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  // Validate content
  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  // Find the comment by ID
  const comment = await Comment.findById(commentId);

  // Check if the comment exists
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if the comment belongs to the authenticated user
  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  // Update the comment content
  comment.content = content;

  // Save the updated comment to the database
  const updatedComment = await comment.save();

  // Return the updated comment in the response
  res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

//  deleting a comment
const deleteComment = asynchandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "comment not found");
  }
  if (comment.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await comment.remove();

  return res
    .status(200)
    .json(new ApiResponse(201, null, "comment deleted successfully"));
});
export { getVideoComments, AddComment, updateComment, deleteComment };
