const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/users");
const secret = process.env.JWT_SECRET;
const auth = require("../../middleware/auth");
const { userValidationSchema } = require("../../models/validation");

// signup user
router.post("/signup", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // email and password validation
    const { error } = userValidationSchema.validate({ email, password });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email in use",
      });
    }

    const newUser = new User({ email });
    // set password
    await newUser.setPassword(password);
    await newUser.save();

    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
          // password: newUser.password,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// login user
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

  try {
    const isPasswordValid = await user.validPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const payload = {
      _id: user._id,
    };

    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    // save token to db
    user.token = token;
    await user.save();

    res.status(200).json({
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

// logout user
router.post("/logout", auth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user.token = null;
    await req.user.save();

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// get the user data
router.get("/current", auth, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: req.user.email,
      subscription: req.user.subscription,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
