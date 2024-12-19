const mongoose = require("mongoose");

//Schema
const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: [true, "userNme is required"],
        },
        email: {
            type: String,
            required: [true, "email is required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
        address: {
            type: Array,
        },
        phone: {
            type: String,
            required: [true, "phone number is required"],
        },
        userType: {
            type: String,
            required: [true, "userType is required"],
            default: "client",
            enum: ["client", "admin", "vendor", "driver"],
        },
        Profile: {
            type: String,
            default:
                "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png",
        },

        answer: {
            type: String,
            required: [true, "Answer is required"],
        },
    },
    { timestamps: true }
);

//export
module.exports = mongoose.model('User', userSchema); 