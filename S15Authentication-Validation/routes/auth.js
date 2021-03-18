const express = require("express");

const authController = require("../controllers/auth");

const validation = require("../middleware/validation");

const Router = express.Router();

Router.get("/login", authController.getLogin);

Router.get("/signup", authController.getSignup);

Router.get("/reset-password", authController.getResetPassword);

Router.get("/reset/:token", authController.getNewPassword);

Router.post("/login", validation.loginValidation, authController.postLogin);

Router.post("/logout", authController.postLogout);

//Router.post("/signup", authController.postSignup);
Router.post("/signup", validation.signupValidation, authController.postSignup);

Router.post("/reset-password", authController.postResetPassword);

Router.post("/new-password", authController.postNewPassword);

module.exports = Router;
