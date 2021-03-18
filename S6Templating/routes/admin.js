const path = require("path");
const express = require("express");

const rootDir = require("../util/path");

const Router = express.Router();

const products = [];

// /admin/add-product => GET
Router.get("/add-product", (req, res, next) => {
  //res.sendFile(path.join(rootDir, "views", "add-product.html"));
  // res.render("add-product", {
  //   pageTitle: "Add Product",
  //   path: "/admin/add-product",
  // }); // pug
  res.render("add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    productPage: true,
    formsCSS: true,
    productCSS: true,
  }); // handlebars
});

// /admin/add-product => POST
Router.post("/add-product", (req, res, next) => {
  products.push({ title: req.body.title });
  res.redirect("/");
});

exports.router = Router;
exports.products = products;
