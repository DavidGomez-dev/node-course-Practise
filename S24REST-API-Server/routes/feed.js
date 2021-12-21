const express = require("express");
const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");

const Router = express.Router();

// GET /feed/posts
Router.get("/posts", isAuth, feedController.getPosts);

Router.post(
  "/post",
  isAuth,
  [body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })],
  feedController.createPost
);

Router.get("/post/:postId", isAuth, feedController.getPost);

Router.put(
  "/post/:postId",
  isAuth,
  [body("title").trim().isLength({ min: 5 }), body("content").trim().isLength({ min: 5 })],
  feedController.updatePost
);

Router.delete("/post/:postId", isAuth, feedController.deletePost);

Router.get("/status", isAuth, feedController.getStatus);

Router.post("/status", isAuth, feedController.updateStatus);

module.exports = Router;
