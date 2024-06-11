import { playlist } from "../models/playlist.model";
import { asynchandler } from "../utilis/asynchandler";
import { ApiResponse } from "../utilis/ApiResponse";
import { ApiError } from "../utilis/ApiError";
import { Video } from "../models/video.model";

// Create Playlist
const CreatePlaylist = asynchandler(async (req, res) => {
  const { name, description, video } = req.body;
  const userId = req.user._id;

  if (!name) {
    throw new ApiError(400, "playlist name is required");
  }

  const Playlist = new playlist({
    description,
    name,
    video,
    user: userId,
  });

  const newPlaylist = await Playlist.save();

  return res
    .status(201)
    .json(new ApiResponse(201, newPlaylist, "new playlist is created"));
});

// Get user Playlists
const GetUserPlaylists = asynchandler(async (req, res) => {
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

  const Playlist = await playlist.aggregate(pipeline);
  const totalCount = await playlist.countDocuments(match);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        Playlist,
        count: totalCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      },
      "Playlists fetched successfully"
    )
  );
});

// Get playlist by ID
const getPlaylistById = asynchandler(async (req, res) => {
  const { playlistId } = req.params;

  // Validate playlist ID
  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  // Define the aggregation pipeline
  const pipeline = [
    { $match: { _id: mongoose.Types.ObjectId(playlistId) } },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        user: {
          _id: "$userDetails._id",
          name: "$userDetails.name",
          email: "$userDetails.email",
        },
        videos: "$videoDetails",
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  // Execute the aggregation pipeline
  const result = await Playlist.aggregate(pipeline);

  if (!result || result.length === 0) {
    throw new ApiError(404, "Playlist not found");
  }

  // Return the playlist data
  return res
    .status(200)
    .json(new ApiResponse(200, result[0], "Playlist fetched successfully"));
});

export { CreatePlaylist, GetUserPlaylists, getPlaylistById };
