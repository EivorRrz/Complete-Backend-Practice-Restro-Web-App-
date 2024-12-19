const foodModel = require("../models/foodModel");
const orderModel = require("../models/orderModel");

// Create Food!!
const createFoodController = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            imageUrl,
            foodTags,
            category,
            code,
            isAvailable,
            restaurant,
            rating,
        } = req.body;

        if (!title || !description || !price || !restaurant) {
            return res.status(400).send({
                success: false,
                message: "Title, description, price, and restaurant are required.",
            });
        }
        const newFood = new foodModel({
            title,
            description,
            price,
            imageUrl,
            foodTags,
            category,
            code,
            isAvailable,
            restaurant,
            rating,
        });
        await newFood.save();
        res.status(201).send({
            success: true,
            message: "Food created successfully.",
            newFood,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in Create Food API!",
            error: error.message,
        });
    }
};

// Get All Foods
const getAllFoodsController = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.status(200).send({
            success: true,
            totalFood: foods.length,
            foods,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in Get All Foods API!",
            error: error.message,
        });
    }
};

// Get Single Food
const getSingleFoodController = async (req, res) => {
    try {
        const food = await foodModel.findById(req.params.id);
        if (!food) {
            return res.status(404).send({
                success: false,
                message: "Food Not Found.",
            });
        }
        res.status(200).send({
            success: true,
            food,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in Get Single Food API!",
            error: error.message,
        });
    }
};

// Get Food by Restaurant
const getFoodResourceController = async (req, res) => {
    try {
        const foods = await foodModel.find({ restaurant: req.params.restaurantId });
        res.status(200).send({
            success: true,
            totalFood: foods.length,
            foods,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in Get Food By Restaurant API!",
            error: error.message,
        });
    }
};

// Update Food Item
const updateFoodController = async (req, res) => {
    try {
        const updatedFood = await foodModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedFood) {
            return res.status(404).send({
                success: false,
                message: "Food Not Found.",
            });
        }
        res.status(200).send({
            success: true,
            message: "Food Updated Successfully.",
            updatedFood,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in Update Food API!",
            error: error.message,
        });
    }
};

// Delete Food
const deleteFoodController = async (req, res) => {
    try {
        const food = await foodModel.findByIdAndDelete(req.params.id);
        if (!food) {
            return res.status(404).send({
                success: false,
                message: "Food Not Found.",
            });
        }
        res.status(200).send({
            success: true,
            message: "Food Item Deleted.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in Delete Food API!",
            error: error.message,
        });
    }
};

// Place Order
const placeOrderController = async (req, res) => {
    try {
        const { cart, id } = req.body;
        if (!cart || cart.length === 0) {
            return res.status(400).send({
                success: false,
                message: "Cart is required and cannot be empty.",
            });
        }
        const total = cart.reduce((acc, item) => acc + item.price, 0);
        const newOrder = new orderModel({ foods: cart, payment: total, buyer: id });
        await newOrder.save();
        res.status(201).send({
            success: true,
            message: "Order Placed Successfully.",
            newOrder,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in Place Order API!",
            error: error.message,
        });
    }
};

// Change Order Status
const orderStatusController = async (req, res) => {
    try {
        const order = await orderModel.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!order) {
            return res.status(404).send({
                success: false,
                message: "Order Not Found.",
            });
        }
        res.status(200).send({
            success: true,
            message: "Order Status Updated.",
            order,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in Order Status API!",
            error: error.message,
        });
    }
};

module.exports = {
    createFoodController,
    getAllFoodsController,
    getSingleFoodController,
    getFoodResourceController,
    updateFoodController,
    deleteFoodController,
    placeOrderController,
    orderStatusController,
};
