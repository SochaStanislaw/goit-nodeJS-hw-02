const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/users");
const secret = process.env.JWT_SECRET;
const auth = require("../../middleware/auth");
const { userValidationSchema } = require("../../models/validation");

const gravatar = require("gravatar");

const path = require("path");
const Jimp = require("jimp");
const fs = require("fs");
const upload = require("../../config/config-multer");

const { sendVerifyEmail } = require("../../config/config-nodemailer");
const { nanoid } = require("nanoid");

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

    // make token by nanoid
    const emailToken = nanoid();

    // get avatar
    const gravatarEmail = email.trim().toLowerCase();
    const avatarURL = gravatar.url(gravatarEmail, {
      s: "250",
      r: "pg",
      d: "robohash",
    });

    // create new user
    const newUser = new User({
      email,
      avatarURL,
      verificationToken: emailToken,
    });

    // set password
    await newUser.setPassword(password);
    await newUser.save();

    // send email with verify link
    await sendVerifyEmail({ email, emailToken: newUser.emailToken });

    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
          avatarURL: newUser.avatarURL,
          emailToken: newUser.verificationToken,
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
        avatar: user.avatarURL,
      },
    });
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

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Please upload a file." });
    }

    try {
      const filePath = path.join("tmp", file.filename);
      const newFilePath = path.join("public", "avatars", file.filename);
      // make avatar
      const image = await Jimp.read(filePath);
      await image.resize(250, 250).writeAsync(filePath);

      // move avatar
      fs.renameSync(filePath, newFilePath);

      // update user avatarURL field
      const avatarURL = `/avatars/${file.filename}`;
      req.user.avatarURL = avatarURL;
      await req.user.save();

      res.status(200).json({ avatarURL });
    } catch (error) {
      next(error);
    }
  }
);

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

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { emailToken } = req.params;
    const user = await User.findOne({ emailToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndUpdate(user._id, { emailToken: "", verify: true });

    res.json({ message: "Verify all good" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something gone wrong :(" });
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Your email is already verified" });
    }

    if (!user) {
      return res.status(404).json({ message: "This user does not exist" });
    }

    await sendVerifyEmail({ email, emailToken: user.emailToken });
    res.status(200).json({ message: "Verify email sent!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server doesn't like u :(" });
  }
});

module.exports = router;
