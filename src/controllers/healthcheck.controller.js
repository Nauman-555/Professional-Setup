import { asynchandler } from "../utilis/asynchandler";
import { ApiError } from "../utilis/ApiError";
import { ApiResponse } from "../utilis/ApiResponse";

const handleCheck = asynchandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, "Everything is ok!"));
});

export { handleCheck };
