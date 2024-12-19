const mongoose = require('mongoose');
const colors = require('colors');

//function mongodb database connection

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Successfully");
    } catch (error) {
        console.log("Error connecting to MongoDB Successfully")
    }
}
module.exports = connectDb;