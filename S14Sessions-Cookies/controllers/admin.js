const Product = require("../models/product");
//const User = require("../models/user");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    user: req.session.user,
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getProductsList = (req, res, next) => {
  Product.find()
    //.populate("userId")
    .then((products) => {
      //console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Products list (Admin view)",
        path: "admin/products",
        user: req.session.user,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddProducts = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.session.user, //Automatically grabs the id
  });
  product
    .save()
    .then((err) => {
      //console.log(err);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === "true"; // the req is a string, to make it boolean
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        product: product,
        pageTitle: "Edit Product",
        path: "/admin/add-product",
        editing: editMode,
        user: req.session.user,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  Product.findByIdAndUpdate(id, {
    title: updatedTitle,
    price: updatedPrice,
    description: updatedDescription,
    imageUrl: updatedImageUrl,
  })
    .then(() => {
      res.redirect("products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(() => {
      res.redirect("products");
    })
    .catch((err) => {
      console.log(err);
    });
};
