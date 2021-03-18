const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

const errorHandler = require("../util/errorHandler"); //Import a function to handle errors

exports.getProducts = (req, res, next) => {
  Product.find()
    .lean() // Just to return a POJO Pleain Old Javascript Objscet (save memory)
    .then((products) => {
      //console.log(req.isLoggedIn);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products list (User view)",
        path: "/product-list",
      });
    })
    .catch((err) => errorHandler(err, next));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  //Product.findAll({where:{id:prodId}}).then().catch; //Alternative
  Product.findById(prodId)
    .lean()
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: "Product details of product:" + product.title,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getShop = (req, res, next) => {
  // Index page
  Product.find()
    .lean()
    .then((product) => {
      //console.log("Shop", req.session.isLoggedIn);
      res.render("shop/index", {
        prods: product,
        pageTitle: "My cool Shop",
        path: "/",
      });
    })
    .catch((err) => errorHandler(err, next));
};

exports.getCart = (req, res, next) => {
  //User.findById(req.user).populate("cart.items.productId").then()
  req.session.user
    .populate("cart.items.productId")
    .execPopulate() // For returning a Promise
    .then((user) => {
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: user.cart.items,
      });
    })
    .catch((err) => errorHandler(err, next));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  //console.log(typeof req.session.user);
  req.session.user
    .addToCart(prodId) // addTocart, methoh defined in the userSchema
    .then((result) => {
      //console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => errorHandler(err, next));
};

exports.deleteItem = (req, res, next) => {
  const prodId = req.body.productId;
  req.session.user
    .deleteItemFromCart(prodId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => errorHandler(err, next));
};

exports.getOrders = (req, res, next) => {
  Order.find({ userId: req.session.user })
    //.populate("items.productId")
    // req.user
    // .getOrders() //eager loading to place all the products in every elemtn of the array
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((err) => errorHandler(err, next));
};

exports.postOrders = (req, res, next) => {
  req.session.user
    .addOrder()
    .then(res.redirect("/orders"))
    .catch((err) => errorHandler(err, next));
};
