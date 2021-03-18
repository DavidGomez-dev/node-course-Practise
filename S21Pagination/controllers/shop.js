const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

const errorHandler = require("../util/errorHandler"); //Import a function to handle errors

const ITEMS_PER_PAGE = 2;

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
  const page = req.query.page ? req.query.page : 1;
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
