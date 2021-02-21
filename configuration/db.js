const mongoose = require("mongoose");

const MONGOURL = "mongodb+srv://home-schooling:godislove158@cluster0.ncicr.mongodb.net/HomeSchooling?w=majority&retryWrites=true";

const MongoServer = async() => {
    try {
        await mongoose.connect(MONGOURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to DB !!");
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports = MongoServer;