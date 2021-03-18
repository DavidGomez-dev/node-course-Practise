const express = require("express");

const shopController = require("../controllers/shop");

const isauth = require("../middleware/is-auth"); //middleware to prtect routes

const Router = express.Router();

Router.get("/", shopController.getShop);

Router.get("/products", shopController.getProducts);

Router.get("/products/:productId", shopController.getProduct);

Router.get("/cart", isauth, shopController.getCart);

Router.post("/cart", isauth, shopController.postCart);

Router.post("/cart-delete-item", isauth, shopController.deleteItem);

Router.get("/orders", isauth, shopController.getOrders);

Router.get("/orders/:orderId", isauth, shopController.getInvoice);

Router.post("/create-order", isauth, shopController.postOrders);

// Router.get("/checkout", shopController.getCheckout);

module.exports = Router;
