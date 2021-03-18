const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const expressHbs = require("express-handlebars");

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

// EJS Template
app.set("view engine", "ejs");
app.set("views", "views"); //redundant, the default is /views

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes.router);
app.use(shopRoutes);

app.use((req, res) => {
  //res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res.status(404).render("404", { pageTitle: "404 Page not Found" });
});

app.listen(3000);
