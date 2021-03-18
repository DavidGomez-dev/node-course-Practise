// Validation for the forms
const { check, body } = require("express-validator");

const User = require("../models/user");

exports.signupValidation = [
  //Export an Array
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        //Check if the emial exists Async
        if (user) {
          return Promise.reject("Email already exist"); // with reject a error is thrown
        }
      });
    })
    .normalizeEmail(), //Sanitazing email
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password 5 characters minimum")
    .isAlphanumeric()
    .withMessage("Password only alphanumeric values")
    .trim(),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password do not match");
      }
      return true;
    })
    .trim(),
];

exports.loginValidation = [
  check("email").isEmail().normalizeEmail(),
  body(
    "password",
    "Please enter a valid password (>5 characters long and alphanumeric)"
  )
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),
];

exports.postProductsValidation = [
  body("title", "Title alphanumeric with 3 characters minimum")
    .isString()
    .isLength({ min: 3 })
    .trim(),
  body("price", "Number with decimals").isNumeric(),
  body("description", "Min length 3 characteres, Max length 400 characteres")
    .isLength({ min: 3, max: 400 })
    .trim(),
];
