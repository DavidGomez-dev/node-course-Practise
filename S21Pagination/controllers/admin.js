const Product = require("../models/product");
//const User = require("../models/user");

const fileHelper = require("../util/file");

const { validationResult } = require("express-validator");

const errorHandler = require("../util/errorHandler"); //Import a function to handle errors

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: undefined,
    validationErrors: [],
  });
};

exports.getProductsList = (req, res, next) => {
  Product.find({ userId: req.session.user }) //Only show in admin the product created by that user
    //.populate("userId")
    .then((products) => {
      //console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Products list (Admin view)",
        path: "admin/products",
      });
    })
    .catch((err) => errorHandler(err, next));
};

exports.postAddProducts = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req); //Validation
  if (!image) {
    //If there is no valid image we manually add a validation error
    errors.errors.push({
      msg: "Please Add a picture file of formats supported: png, jpg, jpeg",
    });
  }
  const errorParsed = errors
    .array()
    .reduce((acc, err) => acc + err.msg + "<br>", "");

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: errorParsed,
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: image.path.replace("public", ""), //we just save the path where is stored in a absolute route
    userId: req.session.user, //Automatically grabs the id
  });

  product
    .save()
    .then((err) => {
      //console.log(err);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      //console.log(err);
      errorHandler(err, next);
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
        hasError: false,
        errorMessage: "",
        validationErrors: [],
      });
    })
    .catch((err) => errorHandler(err, next));
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImage = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  const errors = validationResult(req); //Validation
  const errorParsed = errors
    .array()
    .reduce((acc, err) => acc + err.msg + "<br>", "");
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: true,
      hasError: true,
      errorMessage: errorParsed,
      product: {
        _id: id,
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
      },
      validationErrors: errors.array(),
    });
  }

  // Product.findByIdAndUpdate(id, {
  //   title: updatedTitle,
  //   price: updatedPrice,
  //   description: updatedDescription,
  //   imageUrl: updatedImageUrl,
  // })
  Product.findById(id)
    .then((product) => {
      if (product.userId.toString() !== req.session.user._id.toString()) {
        return console.log(
          "Security alert: attented to product edition by unauthorited user"
        );
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      if (updatedImage) {
        // we only update the image if there is a new file
        fileHelper.deleteFile("/public" + product.imageUrl, next); // Delete the previous file
        product.imageUrl = updatedImage.path.replace("public", "");
      }
      return product.save();
    })
    .then(() => {
      res.redirect("products");
    })
    .catch((err) => errorHandler(err, next));
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  //Product.findByIdAndRemove(prodId)
  //Product.deleteone({_id:prodId,userId:req.session.user._id}) //anohter alternative
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.session.user._id.toString()) {
        //A user can only delete the product he created
        return console.log(
          "Security alert: attented to product deletion by unauthorited user"
        );
      }
      fileHelper.deleteFile("/public" + product.imageUrl, next); // Delete the image
      return product.remove();
    })
    .then(() => {
      //TODO Gestionar el caso donde se elimina un producto que esta en Cart
      //* Buscarlo en todas las carteras y elminarlo...
      res.redirect("products");
    })
    .catch((err) => errorHandler(err, next));
};

exports.deleteProductAJAX = (req, res, next) => {
  const prodId = req.params.productId;

  //Product.findByIdAndRemove(prodId)
  //Product.deleteone({_id:prodId,userId:req.session.user._id}) //anohter alternative
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.session.user._id.toString()) {
        //A user can only delete the product he created
        return console.log(
          "Security alert: attented to product deletion by unauthorited user"
        );
      }
      fileHelper.deleteFile("/public" + product.imageUrl, next); // Delete the image
      return product.remove();
    })
    .then(() => {
      //TODO Gestionar el caso donde se elimina un producto que esta en Cart
      //* Buscarlo en todas las carteras y elminarlo...
      res.status(200).json({ message: "Sucess" });
    })
    .catch((err) => res.status(500).json({ message: "Deleted error" }));
};
