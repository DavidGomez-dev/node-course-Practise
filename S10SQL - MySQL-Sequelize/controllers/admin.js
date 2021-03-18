const Product = require("../models/product");
const User = require("../models/user");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    user: req.user,
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === "true"; // the req is a string, to make it boolean
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  req.user
    .getProducts({ where: { id: prodId } }) //Only producst of the user /MAGIC Connection
    //Product.findByPk(prodId)
    .then((products) => {
      const product = products[0];
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        product: product,
        pageTitle: "Edit Product",
        path: "/admin/add-product",
        editing: editMode,
        user: req.user,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProductsList = (req, res, next) => {
  req.user
    .getProducts() //to narrow to only user for the users /MAGIC Connection
    //Product.findAll()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Products list (Admin view)",
        path: "admin/products",
        user: req.user,
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
  req.user
    .createProduct({
      //Magic Association by Sequelize. it creates a method createProduct
      title: title,
      imageUrl: imageUrl,
      price: price,
      description: description,
    })
    .then((err) => {
      //console.log(err);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.productId;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  Product.findByPk(id)
    .then((product) => {
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      //console.log(product);
      return product.save();
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
  Product.findByPk(prodId)
    .then((product) => {
      return product.destroy(); // return to pass to the next then()
    })
    .then(() => {
      res.redirect("products");
    })
    .catch((err) => {
      console.log(err);
    });
};
