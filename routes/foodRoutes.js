const express = require("express");
const {
    createFoodController,
    getAllFoodsController,
    getSingleFoodController,
    getFoodResourceController,
    updateFoodController,
    deleteFoodController,
    placeOrderController,
    orderStatusController,
} = require("../controllers/foodController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();


router.post("/food", createFoodController);


router.get("/foods", getAllFoodsController);


router.get("/food/:id", getSingleFoodController);


router.get("/foods/restaurant/:restaurantId", getFoodResourceController);

router.put("/food/:id",authMiddleware, updateFoodController);


router.delete("/food/:id", authMiddleware,deleteFoodController);


router.post("/order", authMiddleware,placeOrderController);


router.put("/order/:id/status",authMiddleware,adminMiddleware, orderStatusController);

module.exports = router;
