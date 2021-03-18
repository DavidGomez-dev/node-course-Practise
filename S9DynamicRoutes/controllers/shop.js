// const path = require("path");
// const rootDir = require("../util/path");

const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "Products list (User view)",
      path: "/product-list",
    });
  }); //when fetchAll return the prodcts array, execute the callback function
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId, (product) => {
    //console.log(product);
    res.render("shop/product-detail", {
      product: product,
      pageTitle: "Product details of product:" + product.title,
      path: "/products",
    });
  });
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
  Cart.getCart((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (product of products) {
        const cartProductData = cart.products.find(
          (prod) => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }

      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: cartProducts,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.addProduct(prodId, product.price);
    res.redirect("/cart");
  });
};

exports.deleteItem = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect("/cart");
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
