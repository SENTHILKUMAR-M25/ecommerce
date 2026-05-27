import jwt from "jsonwebtoken";
import User from "../models/User.js";



export const protect = async (req, res, next) => {
  let token;

  try {

    console.log("AUTH HEADER =>", req.headers.authorization);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log("TOKEN =>", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';
    const decoded = jwt.verify(
      token,
      secret
    );

    console.log("DECODED =>", decoded);

    const user = await User.findById(decoded.id).select("-password");

    console.log("USER =>", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found with this token",
      });
    }

    req.user = user;

    next();

  } catch (error) {

    console.log(error);

    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed or expired",
    });
  }
};
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('Access denied. Administrator privileges required.'));
  }
};
