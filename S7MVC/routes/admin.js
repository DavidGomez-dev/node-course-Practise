const express = require("express");

const adminController = require("../controllers/admin");

const Router = express.Router();

// /admin/add-product => GET
Router.get("/add-product", adminController.getAddProduct);

// /admin/products-admin-list => GET
Router.get("/products-admin-list", adminController.getProductsList);

// /admin/add-product => POST
Router.post("/add-product", adminController.postAddProducts);

module.exports = Router;
