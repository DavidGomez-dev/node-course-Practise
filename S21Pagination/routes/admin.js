const express = require("express");

const adminController = require("../controllers/admin");

const isauth = require("../middleware/is-auth"); //middleware to prtect routes

const validation = require("../middleware/validation");

const Router = express.Router();

// /admin/add-product => GET
Router.get("/add-product", isauth, adminController.getAddProduct);

// /admin/products-admin-list => GET
Router.get("/products", isauth, adminController.getProductsList);

// /admin/add-product => POST
Router.post(
  "/add-product",
  validation.postProductsValidation,
  isauth,
  adminController.postAddProducts
);

Router.get("/edit-product/:productId", isauth, adminController.getEditProduct);

Router.post(
  "/edit-product",
  validation.postProductsValidation,
  isauth,
  adminController.postEditProduct
);

//Router.post("/delete-product", isauth, adminController.deleteProduct); // for HTTP only

Router.delete("/product/:productId", isauth, adminController.deleteProductAJAX);

module.exports = Router;
