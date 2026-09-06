const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Teacher = require("../models/Teacher");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.teacher = await Teacher.findById(decoded.id).select("-password");
      if (!req.teacher) {
        res.status(401);
        throw new Error("Not authorized, teacher not found");
      }
      return next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token invalid or expired");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});

module.exports = { protect };
