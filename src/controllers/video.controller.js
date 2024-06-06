import { asynchandler } from "../utilis/asynchandler.js";
import { ApiError } from "../utilis/ApiError.js";
import { Video } from "../models/video.model.js";
import { UploadOnCloudinary } from "../utilis/Cloudinary.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

export { getallvideos };
