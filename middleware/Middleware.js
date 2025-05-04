import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
   
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    const tokenParts = req.headers.authorization.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(400).json({ message: "Invalid Token Format" });
    }

    const token = tokenParts[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    console.log("JWT Verification Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token Expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid Token" });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
