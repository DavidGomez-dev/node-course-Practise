const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
  });
};

exports.getProductsList = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("admin/products-admin-list", {
      prods: products,
      pageTitle: "Products list (Admin view)",
      path: "admin/products-admin-list",
    });
  }); //when fetchAll return the prodcts array, execute the callback function
};

exports.postAddProducts = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(title, imageUrl, price, description);
  product.save(); // just adding t to the products array
  res.redirect("products-admin-list");
};
