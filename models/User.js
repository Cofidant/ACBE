const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter your Name"],
    minlength: 4,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, "Enter your Email Address"],
    match: [
      /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
      "Enter a Valid Email Address",
    ],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Enter your Password"],
    minlength: 6,
  },
});

UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    process.env.jwtSecret,
    {
      expiresIn: process.env.jwtLifetime,
    }
  );
};

UserSchema.methods.comparePassword = async function (userpassword) {
  const isMatched = await bcrypt.compare(userpassword, this.password);

  return isMatched;
};

module.exports = mongoose.model("User", UserSchema);
