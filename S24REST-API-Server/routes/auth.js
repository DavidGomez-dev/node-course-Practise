const express = require("express");
const authController = require("../controllers/auth");
// const feedController = require("../controllers/feed");
const { body } = require("express-validator");

const User = require("../models/user");

const Router = express.Router();

Router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("User email already exist");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

Router.post("/login", authController.login);

module.exports = Router;
