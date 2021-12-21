const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const errorHandler = (err) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  return next(err);
};

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      name: name,
      password: hashedPw,
    });
    const result = await user.save();
    if (result) {
      res.status(201).json({ message: "User created", userId: result._id });
    }
  } catch (error) {
    errorHandler(error);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user this email could not be found");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password or email");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign({ email: user.email, userId: user._id.toString() }, process.env.SECRETKEY, {
      expiresIn: "1h",
    });
    res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (error) {
    errorHandler(error);
  }
};
