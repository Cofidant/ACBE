const User = require("../models/User");
const statusCodes = require("http-status-codes");
const { BadRequest, UnAuthenticated } = require("../errors");
const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  res.status(statusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequest("Enter Email and Password");
  }

  const user = await User.findOne({ email });
  // compare

  if (!user) {
    throw new UnAuthenticated("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnAuthenticated("Invalid Credentials");
  }

  const token = user.createJWT();
  res.status(statusCodes.OK).json({ user: { name: user.name }, token });
};

module.exports = {
  register,
  login,
};
