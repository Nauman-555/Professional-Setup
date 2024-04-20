const asynchandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    // .catch is basically .reject....whatever we want can use
  };
};
export { asynchandler };
// this we made is a wrapper so that we don't need to do promise/trycatch again & again
