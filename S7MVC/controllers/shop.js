// const path = require("path");
// const rootDir = require("../util/path");

const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "Products list (User view)",
      path: "/product-list",
    });
  }); //when fetchAll return the prodcts array, execute the callback function
};

exports.getShop = (req, res, next) => {
  // Index page
  Product.fetchAll((products) => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "My cool Shop",
      path: "/",
    });
  }); //when fetchAll return the prodcts array, execute the callback function
};

exports.getCart = (req, res, next) => {
  res.render("shop/cart", {
    pageTitle: "Cart",
    path: "/cart",
  });
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    pageTitle: "Your Orders",
    path: "/orders",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};
