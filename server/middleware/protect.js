import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const authorization = req.headers.authorization;
 
  if (!authorization) {
    return res.status(401).json({
      message: "Token is required",
    });
  }
 
  const token = authorization.replace("Bearer ", "");
 
  try {
    const jwtSecret = process.env.JWT_SECRET || "fallback_development_secret";

    console.log("Secret in protect:", jwtSecret);
    const payload = jwt.verify(token, jwtSecret);
 
    req.user = {
      userId: payload.userId,
      username: payload.username,
    };
 
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token is invalid or expired",
    });
  }
}