import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config({
  path: "./env",
  // the above object may or may not be here!
});

connectDB()
  // As we are avoiding require syntax for importing dotenv.
  // Therefore, we are using the above config function and also
  // such lines in package.json '-r dotenv/config --experimental-json-modules'

  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`The Server is running on Port:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Connection failed by error:", err);
  });
