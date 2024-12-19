const categoryModel = require("../models/categoryModel");

// Create category
const CreateController = async (req, res) => {
  try {
    const { title, imageUrl } = req.body; // Request object

    // Validation
    if (!title) {
      return res.status(400).send({
        success: false,
        message: "Title is required.",
      });
    }

    // Create a new category
    const newCategory = new categoryModel({ title, imageUrl });
    await newCategory.save();

    res.status(201).send({
      success: true,
      message: "Category created successfully.",
      newCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Create Category API!",
      error,
    });
  }
};

// Get all categories
const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.status(200).send({
      success: true,
      totalCat: categories.length,
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get All Categories API!",
      error,
    });
  }
};

// Update category
const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from parameters
    const { title, imageUrl } = req.body; // Get title and image from body

    // Find and update category
    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { title, imageUrl },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).send({
        success: false,
        message: "Category not found.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Category updated successfully.",
      updatedCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update Category API!",
      error,
    });
  }
};

// Delete category
const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Category ID is required.",
      });
    }

    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found with this ID.",
      });
    }

    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Delete Category API!",
      error,
    });
  }
};

module.exports = {
  CreateController,
  getAllCategoriesController,
  updateCategoryController,
  deleteCategoryController,
};
