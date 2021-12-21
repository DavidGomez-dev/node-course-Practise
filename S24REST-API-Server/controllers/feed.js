const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const Post = require("../models/post");
const User = require("../models/user");

// Helpers
const errorHandler = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  return next(err);
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

//Controllers
exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;

  try {
    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.json({
      message: "Post fetched",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    errorHandler(err, next);
  }
  // Post.find()
  //   .then((posts) => {
  //     res.json({
  //       message: "Post fetched",
  //       posts: posts,
  //     });
  //   })
  //   .catch((err) => errorHandler(err,next));
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could nbot find post.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: "Post fetched",
        post: post,
      });
    })
    .catch((err) => errorHandler(err, next));
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, error in entering data");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;

  // crete post in db
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  //console.log(req.userId);
  //console.log(post);

  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.push(post);
      return user.save();
    })
    .then((user) => {
      res.status(201).json({
        message: "Post created succesfully",
        post: post,
        creator: { _id: user._id, name: user.name },
      });
    })
    .catch((err) => errorHandler(err, next));
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, error in entering data");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized.");
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated", post: result });
    })
    .catch((err) => errorHandler(err, next));
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized.");
      error.statusCode = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    const result = await Post.findByIdAndRemove(postId);
    if (result) {
      const user = await User.findById(req.useId);
      user.post.pull(postId);
      user.save();
      res.status(200).json({ message: "Post deleted" });
    }
  } catch (err) {
    errorHandler(err, next);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Could nbot find user.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "User status fetched",
      status: user.status,
    });
  } catch (error) {
    errorHandler(error, next);
  }
};

exports.updateStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  //console.log(newStatus);
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("Could nbot find user.");
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    const result = await user.save();
    if (result) {
      res.status(200).json({
        message: "User status updated",
        status: user.status,
      });
    }
  } catch (error) {
    errorHandler(error, next);
  }
};
