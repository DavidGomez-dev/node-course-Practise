const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);

// const getDb = require("../util/database").getDb;
// const ObjectId = require("mongodb").ObjectId;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       //Update a product
//       dbOp = db
//         .collection("products")
//         .updateOne({ _id: new ObjectId(this._id) }, { $set: this });
//     } else {
//       //Create a product
//       dbOp = db.collection("products").insertOne(this);
//     }
//     return dbOp
//       .then((result) => {
//         //console.log(result);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find() // it retrun a courser where we an retrieve step by step
//       .toArray() // Only for less than 100 documents
//       .then((products) => {
//         //console.log(products);
//         return products;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findById(id) {
//     const db = getDb();
//     const idObject = new ObjectId(id);
//     return (
//       db
//         .collection("products")
//         // .find({ _id: id }) // Another option
//         // .next()
//         .findOne({ _id: idObject })
//         .then((product) => {
//           //console.log(product);
//           return product;
//         })
//         .catch((err) => {
//           console.log(err);
//         })
//     );
//   }

//   static deleteById(id) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new ObjectId(id) })
//       .then((result) => {
//         console.log("Deleted");
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }

// module.exports = Product;
