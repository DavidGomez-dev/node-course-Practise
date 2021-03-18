const Sequelize = require("sequelize").Sequelize; //We add .Sequelize to make intellisend works

const sequelize = new Sequelize("node-complete", "root", "Mayo2019", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
