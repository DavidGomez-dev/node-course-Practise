require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf"); //CSFR attack prevention
const flash = require("connect-flash"); // Flash messages for session Mesages taht ponly are sent once
const multer = require("multer");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const isauth = require("./middleware/is-auth"); //middleware to prtect routes
const errorController = require("./controllers/error");

const User = require("./models/user");

const MONGO_DB_URI = process.env.MONGO_DB_URI;

const app = express();
const store = new MongoDBStore({
  uri: MONGO_DB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

// EJS Template
app.set("view engine", "ejs");
//app.set("views", "views"); //redundant, the default is /views

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); //we store in the public folder
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname); // We generate a almost unique name with the timestamp and the original name
  },
});

const fileFilterFun = (req, file, cb) => {
  if (
    ["image/png", "image/jpg", "image/jpeg"].some((e) => e === file.mimetype) //Check if any of this formats are the mimetype
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilterFun }).single("image")
); //Multer will look for 'image' on the forms name received
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(express.static(path.join(__dirname, "public")));
//app.use("/images", express.static(path.join(__dirname, "images"))); //We serve the images statically

app.use(csrfProtection);
app.use(flash());

//This code is a middleware for having the User MogodbObject available in all the request
app.use((req, res, next) => {
  User.findById(req.session.user)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.session.user = new User(user); // create a MogodbObject passng the database values
      next();
    })
    .catch((err) => {
      console.log(err);
      next(new Error(err));
    });
});

// We use locals to define variables that have to pass in every render
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", isauth, adminRoutes); //protect all the admin routes
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

// //The next(error) function ends here
// app.use((error, req, res, next) => {
//   //res.status(error.httpStatusCode).render(...)
//   res.redirect("/500");
// });

mongoose
  .connect(MONGO_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((result) => {
    console.log("Connected to Mongo db using mongoose");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
