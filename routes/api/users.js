const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/users");
const { userValidationSchema } = require("../../models/validation");
const authenticate = require("../../middleware/authenticate");

// JWT token maker func
const generateAuthToken = (user) => {
  if (!user || !user._id) {
    throw new Error("User object is invalid");
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return token;
};

// signup new user endpoint
router.post("/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // console.log("Received email:", email);
    // console.log("Received password:", password);

    // checkout data fo signup
    const { error } = userValidationSchema.validate({ email, password });

    if (error) {
      let errorMessage =
        "Password must contain at least one digit, one uppercase letter and one special character";

      // error message depends forom error type when password does not follow requirements
      if (error.details[0].type === "string.min") {
        errorMessage = "Password must be at least 8 characters long";
      } else if (error.details[0].type === "string.patter.base") {
        errorMessage =
          "Password must contain at least one digit, one uppercase letter and one special character";
      }

      // console.log("Validation error:", error);

      res.status(400).json({ message: errorMessage });
      return;
    }

    // checkout the email is already exist
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already in use :( Please try diffrent address.",
      });
    }

    // hash password before save to db
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // create new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // generate token and address to new user
    const token = generateAuthToken(newUser);

    res.status(201).json({
      message: "Success! Your profile has been created!",
      user: { email: newUser.email, subscription: newUser.subscription },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// login endpoint
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check login data
    const { error } = userValidationSchema.validate({ email, password });

    if (error) {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.details });
    }

    // find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    // comapare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    // generate JWT token for user
    const token = generateAuthToken(user);

    // save token
    user.token = token;
    await user.save();

    res.status(200).json({
      message: "You are log in successfully",
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (error) {
    next(error);
  }
});

// logout endpoint
router.get("/logout", authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // delete current user token and change to null
    req.user.token = null;

    // save to db
    await req.user.save();

    res
      .status(200)
      .json({ message: "You logout successfully! See you next time!" });
  } catch (error) {
    next(error);
  }
});

// endpont current user
router.get("/current", authenticate, async (req, res, next) => {
  try {
    // get the current user from req.user
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({
      email: currentUser.email,
      subscription: currentUser.subscription,
    });
  } catch (error) {
    next(error);
  }
});

// add patch for update type of sub endpoint
router.patch("/", authenticate, async (req, res, next) => {
  try {
    const { subscription } = req.body;

    // check what type of sub
    if (!["starter", "pro", "business"].includes(subscription)) {
      return res.status(400).json({ message: "Invalid type of sub" });
    }

    // update user' sub
    req.user.subscription = subscription;
    await req.user.save();

    res.status(200).json({
      message: `Success! Your sub is updated to ${subscription} type`,
      user: { email: req.user.email, subscription: req.user.subscription },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
