const mongoose = require("mongoose");
const generate = require("../helper/generate");

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: {
      type: String,
      default: "",
    },
    password: String,
    token: {
      type: String,
      default: () => generate.generateRandomString(30),
    },
    deleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
