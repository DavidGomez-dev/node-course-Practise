const express = require("express");

const shopController = require("../controllers/shop");

const Router = express.Router();

Router.get("/", shopController.getShop);

Router.get("/products", shopController.getProducts);

Router.get("/cart", shopController.getCart);

Router.get("/orders", shopController.getOrders);

Router.get("/checkout", shopController.getCheckout);

module.exports = Router;
