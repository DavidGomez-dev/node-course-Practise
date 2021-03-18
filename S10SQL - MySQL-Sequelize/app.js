const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
//const expressHbs = require("express-handlebars");

const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

//This code is a middleware for having the User available in all the request
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user; // Lo metemos en el objeto req
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

// EJS Template
app.set("view engine", "ejs");
app.set("views", "views"); //redundant, the default is /views

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product); //Redundant but useful to have full MAGIC methods
User.hasOne(Cart);
Cart.belongsTo(User); //Redundant but useful to have full MAGIC methods
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  //.sync({ alter: true }) //to force table changes  from Zero
  //.sync({ force: true }) //to force table creation from Zero
  .sync()
  .then((result) => {
    //Creation of Dummy user
    return User.findByPk(1);
    //console.log(result);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "David", email: "test@test.com" });
    }
    return user; //Should be a promise, but it is done by default.
  })
  .then((user) => {
    console.log("Dummy username: ", user.name);
    return user.getCart();
  })
  .then((cart) => {
    if (cart) {
      return;
    } else {
      return user.createCart(); //Initialize a cart if does not exist
    }
  })
  .then((cart) => {
    app.listen(3000); // Server start if the the database starts
  })
  .catch((err) => {
    console.log(err);
  });
