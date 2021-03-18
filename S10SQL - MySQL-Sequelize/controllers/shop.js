// const path = require("path");
// const rootDir = require("../util/path");

const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
  Product.findByPk(prodId)
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
  Product.findAll()
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
    .then((cart) => {
      return cart.getProducts();
    })
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
  let cartFetched;
  let newQuantity;
  req.user
    .getCart() // Retrieve the cart of the user
    .then((cart) => {
      cartFetched = cart;
      return cart.getProducts({ where: { id: prodId } }); // Find if there is that product already on the cart
    })
    .then((products) => {
      if (products.length > 0) {
        // If the product is already on the cart (products has elements)
        newQuantity = products[0].cartItem.quantity + 1; // Add one more to the exiting
        return products[0];
      } else {
        // if there is no that product on the cart
        newQuantity = 1;
        return Product.findByPk(prodId); //First retrieve the product
      }
    })
    .then((product) => {
      // Add the just fetched or existing product to the Cart with the local quantity calculated
      return cartFetched.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteItem = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.removeProduct(prodId); //MAGIC association
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ["products"] }) //eager loading to place all the products in every elemtn of the array
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
  let fetchedProducts;
  let fetchedCart;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      fetchedProducts = products;
      return req.user.createOrder();
    })
    .then((order) => {
      return order.addProducts(
        fetchedProducts.map((product) => {
          product.orderItem = { quantity: product.cartItem.quantity };
          return product;
        })
      );
    })
    .then(() => {
      //return fetchedCart.setProducts(null); // Eliminte all the products from the Cart but keeping the cart
      return fetchedCart.removeProducts(fetchedProducts); // Eliminte all the products from the Cart but keeping the cart
    })
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
