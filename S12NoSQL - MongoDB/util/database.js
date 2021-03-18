const MongoClient = require("mongodb").MongoClient;
const uri = "XXXXX TO ADD";
//database shop
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let _db; // _ means by convention that is a local of this file

const mongoConnect = (callback) => {
  client
    .connect()
    .then((result) => {
      console.log("Connected to Mongo db");
      _db = client.db(); // allow to connect to the database, internally handles a pool
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb; // just to make de database connection available
