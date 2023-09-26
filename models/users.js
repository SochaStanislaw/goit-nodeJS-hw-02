const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: String,
    avatarURL: String,
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  {
    timestamps: true,
  }
);

// set password
userSchema.methods.setPassword = async function (password) {
  const saltRounds = 10;
  this.password = await bcrypt.hash(password, saltRounds);
};

// valid passowrd
userSchema.methods.validPassword = async function (password) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
