const express = require("express");

const adminController = require("../controllers/admin");

const Router = express.Router();

// /admin/add-product => GET
Router.get("/add-product", adminController.getAddProduct);

// /admin/products-admin-list => GET
Router.get("/products", adminController.getProductsList);

// /admin/add-product => POST
Router.post("/add-product", adminController.postAddProducts);

Router.get("/edit-product/:productId", adminController.getEditProduct);

Router.post("/edit-product", adminController.postEditProduct);

Router.post("/delete-product", adminController.deleteProduct);

module.exports = Router;
