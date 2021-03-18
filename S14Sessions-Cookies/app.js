const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");

const User = require("./models/user");

const MONGODB_URI =
  "mongodb+srv://david:mbJulio2019@cluster0.8xkhg.mongodb.net/shop?retryWrites=true&w=majority";

const app = express();
const store = new MongoDBStore({ uri: MONGODB_URI, collection: "sessions" });

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// EJS Template
app.set("view engine", "ejs");
//app.set("views", "views"); //redundant, the default is /views

//This code is a middleware for having the User MogodbObject available in all the request
app.use((req, res, next) => {
  User.findById(req.session.user)
    .then((user) => {
      req.session.user = new User(user); // create a MogodbObject passng the database values
      next();
    })
    .catch((err) => {
      console.log(err);
    });

  //{"_id":{"$oid":"604a2e72f11e824020c22948"},"name":"David","email":"test@test.com"}
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, {
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
