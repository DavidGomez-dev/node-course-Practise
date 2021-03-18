const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");

const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

//This code is a middleware for having the User available in all the request
app.use((req, res, next) => {
  User.findById("604a2e72f11e824020c22948")
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id); // create a Object passng the database values
      next();
    })
    .catch((err) => {
      console.log(err);
    });

  //{"_id":{"$oid":"604a2e72f11e824020c22948"},"name":"David","email":"test@test.com"}
});

// EJS Template
app.set("view engine", "ejs");
//app.set("views", "views"); //redundant, the default is /views

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  app.listen(3000);
});
