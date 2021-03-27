const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

const stripe = require("stripe")(process.env.STRIPE_SK);

const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

const errorHandler = require("../util/errorHandler"); //Import a function to handle errors

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = req.query.page ? +req.query.page : 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProds) => {
      totalItems = numProds;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE) // Skip the first ones
        .limit(ITEMS_PER_PAGE); // Limit to show per page
    })
    .then((products) => {
      //console.log("Shop", req.session.isLoggedIn);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products list (User view)",
        path: "/product-list",
        totalProds: totalItems,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
  const page = req.query.page ? +req.query.page : 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProds) => {
      totalItems = numProds;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE) // Skip the first ones
        .limit(ITEMS_PER_PAGE); // Limit to show per page
    })
    .then((products) => {
      //console.log("Shop", req.session.isLoggedIn);
      res.render("shop/index", {
        prods: products,
        pageTitle: "My cool Shop",
        path: "/",
        totalProds: totalItems,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
      //console.log(user.cart.items);
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

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.session.user
    .populate("cart.items.productId")
    .execPopulate() // For returning a Promise
    .then((user) => {
      products = user.cart.items;
      products.forEach((p) => (total += p.quantity * p.productId.price));

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: "eur",
            quantity: p.quantity,
          };
        }),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        pageTitle: "Checkout",
        path: "/checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => errorHandler(err, next));
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.session.user
    .addOrder()
    .then(res.redirect("/orders"))
    .catch((err) => errorHandler(err, next));
};

exports.postOrders = (req, res, next) => {
  req.session.user
    .addOrder()
    .then(res.redirect("/orders"))
    .catch((err) => errorHandler(err, next));
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = `invoice-${orderId}.pdf`;
  const invoicePath = path.join("invoices", invoiceName);

  Order.findById(orderId) //We protect that the use can only download their orders invoices
    .then((order) => {
      if (!order) {
        const err = new Error("No order found.");
        return errorHandler(err, next);
      }
      if (order.userId.toString() !== req.session.user._id.toString()) {
        const err = new Error("Order do not belong to user");
        return errorHandler(err, next);
      }

      res.setHeader("Content-type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);

      //Creation of new invocie on the fly with PDFkit
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath)); //To save the doc in the folder
      pdfDoc.pipe(res); //To send the doc to the client in the response

      pdfDoc.fontSize(26).text(`Invoice - ${order._id}`, {
        underline: true,
      });
      pdfDoc.text("*************************************");
      let totalPrice = 0;
      order.items.forEach((item) => {
        let itemTotal = item.productId.price * item.quantity;
        totalPrice += itemTotal;
        pdfDoc.text(" ");
        pdfDoc
          .fontSize(14)
          .text(
            `Item: ${item.productId.title}  -  ${item.productId.price} EUR x  ${item.quantity} = ${itemTotal} EUR `
          );
        pdfDoc
          .fontSize(14)
          .text("_______________________________________________");
      });
      pdfDoc.text(`Total: ${totalPrice} EUR`);
      pdfDoc.end();

      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader("Content-type", "application/pdf");
      //   res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
      //   res.send(data);
      // });

      //Streaming data instead
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader("Content-type", "application/pdf");
      // res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
      // file.pipe(res);
    })
    .catch((err) => errorHandler(err, next));
};
