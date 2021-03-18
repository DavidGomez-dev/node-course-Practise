const mongoose = require("mongoose");

const Order = require("./order");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

// We can also defined methods within the Schema
userSchema.methods.addToCart = function (prodId) {
  const itemIndex = this.cart.items.findIndex(
    (item) => item.productId.toString() === prodId.toString()
  );
  if (itemIndex >= 0) {
    this.cart.items[itemIndex].quantity += 1;
  } else {
    this.cart.items.push({ productId: prodId, quantity: 1 });
  }
  return this.save();
};

userSchema.methods.deleteItemFromCart = function (prodId) {
  const updatedCartItems = this.cart.items.filter(
    (item) => item.productId.toString() !== prodId.toString()
  );
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.addOrder = function () {
  return this.populate("cart.items.productId") //save info of the products to make an snapshot
    .execPopulate()
    .then((user) => {
      //console.log(JSON.stringify(user));
      return new Order({
        items: user.cart.items,
        userId: user._id,
      }).save();
    })
    .then((result) => {
      this.cart.items = []; //Clearing the cart
      return this.save();
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = mongoose.model("User", userSchema);
