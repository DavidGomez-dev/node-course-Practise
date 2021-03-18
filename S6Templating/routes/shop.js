const path = require("path");
const express = require("express");

const rootDir = require("../util/path");
const adminData = require("../routes/admin");

const Router = express.Router();

Router.get("/", (req, res, next) => {
  // console.log(adminData.products);
  // res.sendFile(path.join(rootDir, "views", "shop.html"));
  const products = adminData.products;
  //res.render("shop", { prods: products, pageTitle: "My cool Shop", path: "/" }); //pug
  res.render("shop", {
    prods: products,
    pageTitle: "My cool Shop",
    path: "/",
    hasProducts: products.length > 0, //only for handlebars
    shopPage: true, //only for handlebars
    productCSS: true, //only for handlebars
  }); // handlebars
});

module.exports = Router;
