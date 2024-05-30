import jwt from "jsonwebtoken";


const jwtAuthMiddleware = (req, res, next) => {
  //check for the authorization header in the request object
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token not found " });
  }

  // extract the token from the header of the request
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  try {
    //verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json("Invalid token");
  }
};

//gen token
const generateToken = (userData) => {
  return jwt.sign({ userData }, process.env.JWT_SECRET, {
    expiresIn: 30000,
  });
};

export { jwtAuthMiddleware, generateToken };
