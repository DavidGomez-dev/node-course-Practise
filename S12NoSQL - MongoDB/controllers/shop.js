// const path = require("path");
// const rootDir = require("../util/path");

const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products list (User view)",
        path: "/product-list",
        user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  //Product.findAll({where:{id:prodId}}).then().catch; //Alternative
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: "Product details of product:" + product.title,
        path: "/products",
        user: req.user,
      });
    })
    .catch((err) => console.log(err));
};

exports.getShop = (req, res, next) => {
  // Index page
  Product.fetchAll()
    .then((product) => {
      res.render("shop/index", {
        prods: product,
        pageTitle: "My cool Shop",
        path: "/",
        user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: products,
        user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      //console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteItem = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders() //eager loading to place all the products in every elemtn of the array
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
        user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrders = (req, res, next) => {
  req.user
    .addOrder()
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
    user: req.user,
  });
};
