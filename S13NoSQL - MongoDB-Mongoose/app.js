const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");

const User = require("./models/user");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

//This code is a middleware for having the User available in all the request
app.use((req, res, next) => {
  User.findById("604b85ea1166476116696f67")
    .then((user) => {
      req.user = user; // create a Object passng the database values
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

mongoose
  .connect("TO ADD", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((result) => {
    return User.findById("604b85ea1166476116696f67");
  })
  .then((user) => {
    if (user) {
      return;
    } else {
      const userDummy = new User({
        name: "David",
        email: "test@tes.com",
        cart: {
          items: [],
        },
      });
      return userDummy.save();
    }
  })
  .then((result) => {
    console.log("Connected to Mongo db using mongoose");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
