const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
//const expressHbs = require("express-handlebars");

const app = express();

// Handlebars Template
// app.engine(
//   "hbs",
//   expressHbs({
//     layoutsDir: "views/layouts/",
//     defaultLayout: "main-layout",
//     extname: "hbs",
//   })
// );
// app.set("view engine", "hbs");

// Pug Template
// app.set("view engine", "pug");
// app.set("views", "views"); //redundant, the default is /views

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

// EJS Template
app.set("view engine", "ejs");
app.set("views", "views"); //redundant, the default is /views

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
