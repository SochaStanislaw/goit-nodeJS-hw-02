const User = require("../models/users");
const jwt = require("jsonwebtoken");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    // check if authorization header is provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ message: "Token not provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    // decode token and check it is expired
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { exp } = decodedToken;

    const currentTime = Math.floor(Date.now() / 1000);

    // check token is expired
    if (exp <= currentTime) {
      return res.status(403).json({ message: "Token expired" });
    }

    // find user by token id
    const user = await User.findOne({ _id: decodedToken._id, token: token });

    if (!user) {
      return res.status(403).json({ message: "Not authorized" });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    // handle error
    res
      .status(403)
      .json({ message: "Authentication failed", error: error.message });
  }
};

module.exports = authenticate;
