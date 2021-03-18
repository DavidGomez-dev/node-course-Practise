const path = require("path");
const express = require("express");

const rootDir = require("../util/path");

const Router = express.Router();

// /admin/add-product => GET
Router.get("/add-product", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "add-product.html"));
});

// /admin/add-product => POST
Router.post("/add-product", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});

module.exports = Router;
