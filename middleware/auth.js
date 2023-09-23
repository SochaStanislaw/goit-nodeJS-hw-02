const passport = require("passport");

const auth = async (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = auth;
