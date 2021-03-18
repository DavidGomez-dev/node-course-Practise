const getDb = require("../util/database").getDb;
const ObjectId = require("mongodb").ObjectId;

class User {
  constructor(user, email, cart, id) {
    (this.name = user),
      (this.email = email),
      (this.cart = cart), //{items:[]}
      (this._id = id);
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString(); // Compare objects diectly do not work, pass to string
    });

    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      //If the product exists, we update the quantity
      updatedCartItems[cartProductIndex].quantity += 1;
    } else {
      //If the product do not exists, we created
      updatedCartItems.push({ productId: product._id, quantity: 1 });
    }

    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDb();
    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );
    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDb();
    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  getCart() {
    const db = getDb();
    const productsIds = this.cart.items.map((cp) => cp.productId);
    return db
      .collection("products")
      .find({ _id: { $in: productsIds } }) //With $in we can find all from an Array
      .toArray()
      .then((products) => {
        //console.log(products);
        return products.map((p) => {
          //We add the quantities
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      });
  }

  addOrder() {
    const db = getDb();
    const order = {};
    return db
      .collection("orders")
      .insertOne({
        ...this.cart,
        user: { _id: new ObjectId(this._id), name: this.name }, //Add the user
      })
      .then((result) => {
        this.cart.items = [];
        return db
          .collection("users")
          .updateOne({ _id: this._id }, { $set: { cart: this.cart } });
      });
  }

  getOrders() {
    const db = getDb();
    let fetchedOrders;
    return (
      db
        .collection("orders")
        .find({ "user._id": new ObjectId(this._id) }) //Filter by user
        .toArray() // fecth all orders
        .then((orders) => {
          fetchedOrders = orders;
          //console.log(orders);
          const productsIds = [];
          fetchedOrders.forEach((order) => {
            order.items.forEach((item) => {
              productsIds.push(item.productId);
            });
          });
          //console.log(productsIds);
          return db
            .collection("products") // fecth all products from the orders
            .find({ _id: { $in: productsIds } }) //With $in we can find all from an Array
            .toArray();
        })
        .then((products) => {
          //console.log(products);
          return fetchedOrders.map((order) => {
            //Enricht the orders items with the product data
            return {
              _id: order._id,
              items: order.items.map((item) => {
                const prod = products.find(
                  (cp) => cp._id.toString() === item.productId.toString()
                );
                //const prod = products[productDataIndex];
                //console.log(prod);
                return { ...item, ...prod }; //Save the data and quantiity along the product data
              }),
            };
          });
        })
        // .then((result) => {
        //   console.log(JSON.stringify(result));
        // })
        .catch((err) => {
          console.log(err);
        })
    );
  }

  static findById(userId) {
    const db = getDb();
    return db.collection("users").findOne({ _id: new ObjectId(userId) });
  }
}

module.exports = User;
