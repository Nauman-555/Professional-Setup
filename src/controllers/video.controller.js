import { asynchandler } from "../utilis/asynchandler.js";
import { ApiError } from "../utilis/ApiError.js";
import { Video } from "../models/video.model.js";
import { UploadOnCloudinary } from "../utilis/Cloudinary.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import fs from "fs";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";

// Get All Videos
const getallvideos = asynchandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // Creating the match criteria
  let match = {};

  if (query) {
    match.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId) {
    match.owner = mongoose.Types.ObjectId(userId);
  }

  // Creating the sort criteria

  const sort = { [sortBy]: sortType === "asc" ? 1 : -1 };

  // creating pipeline
  const pipeline = [
    { $match: match },
    { $sort: sort },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit, 10) },
  ];

  // fetching the videos
  const videos = await Video.aggregate(pipeline);

  // count the videos
  const count = await Video.countDocuments(match);

  // Response

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, count, page: parseInt(page, 10), limit: parseInt(limit, 10) },
        "Videos Fetched Successfully"
      )
    );
});

// Publish A video
const publishAvideo = asynchandler(async (req, res) => {
  const { title, description } = req.body;
  const videofile = req.files?.videofile[0];
  const thumbnailfile = req.files?.thumbnailfile[0];
  if (!videofile || !thumbnailfile || !title || !description) {
    throw new ApiError(400, "All fields are required");
  }
  // upload on cloudinary
  const videoUpload = await UploadOnCloudinary(videofile.path);
  const thumbnailUpload = await UploadOnCloudinary(thumbnailfile.path);

  if (!(videoUpload.url || thumbnailUpload.url)) {
    throw new ApiError(400, "Error while uploading on cloudinary");
  }

  // clean up local storage
  fs.unlinkSync(videofile.path);
  fs.unlinkSync(thumbnailfile.path);
  // create a user object
  const video = new Video({
    title,
    description,
    videofile: videoUpload.url,
    thumbnailfile: thumbnailUpload.url,
    duration: videoUpload.duration.toString(),
    owner: req.user._id,
  });
  await video.save();

  return res
    .status(201)
    .json(new ApiResponse(201, video, "video uploaded successfully"));
});

// Get user by Id
const getVideoById = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await User.findById(videoId);
  if (!video) {
    throw new ApiError(400, "user not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "user found successfully"));
});

// Update video
const updateVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { description, title } = req.files;
  if (!title || !description) {
    throw new ApiError(400, "title and description are necessary");
  }
  const updatevideo = await User.findByIdAndUpdate(
    videoId,
    { description, title },
    { new: true }
  );
  if (!updatevideo) {
    throw new ApiError(400, "video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(201), updatevideo, "video Updated Successfully");
});

// Delete video
const deleteVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const deletevideo = await Video.findByIdAndDelete(videoId);
  if (!deletevideo) {
    throw new ApiError(400, "video not found");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, deleteVideo, "video deleted successfully"));
});

// togglePublishStatus
const PublishStatus = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "video not found");
  }
  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "toggle status updated"));
});
export {
  getallvideos,
  publishAvideo,
  getVideoById,
  deleteVideo,
  updateVideo,
  PublishStatus,
};
