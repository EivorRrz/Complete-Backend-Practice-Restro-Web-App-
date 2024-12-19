const express = require("express");
const {
  CreateController,
  getAllCategoriesController,
  updateCategoryController,
  deleteCategoryController,
} = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//api"S

router.post("/create", authMiddleware, CreateController);
//get!!
router.get("/getAll", authMiddleware, getAllCategoriesController);
//updateALL
router.put("/update/:id", authMiddleware, updateCategoryController);
//delete
router.delete("/delete/:id", authMiddleware, deleteCategoryController);

module.exports = router;
