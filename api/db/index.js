const mongoose = require("mongoose");
mongoose.Promise = Promise;

module.exports = (dbName, options) => {
    mongoose.connect(dbName, options);
    return mongoose;
};