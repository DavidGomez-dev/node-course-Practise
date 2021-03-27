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

//Router.post("/create-order", isauth, shopController.postOrders);

Router.get("/checkout", isauth, shopController.getCheckout);

//! WATCH OUT: It is important to make sure orders macth payments -> Implemnt webhooks with Stripe
Router.get("/checkout/success", isauth, shopController.getCheckoutSuccess);

Router.get("/checkout/cancel", isauth, shopController.getCheckout);

module.exports = Router;
