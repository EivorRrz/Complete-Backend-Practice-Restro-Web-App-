const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");

// Get User Info
const getUserController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    // Hide password
    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.log("Error in Get User API:", error);
    res.status(500).send({
      success: false,
      message: "Error in Get User API!",
      error: error.message,
    });
  }
};

// Update User Info
const updateUserController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const { userName, address, phone } = req.body;
    if (userName) user.userName = userName;
    if (address) user.address = address;
    if (phone) user.phone = phone;

    await user.save();
    res.status(200).send({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.log("Error in Update User API:", error);
    res.status(500).send({
      success: false,
      message: "Error in Update User API!",
      error: error.message,
    });
  }
};

// Update User Password
const updatePasswordController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Both old and new passwords are required",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "Old password is incorrect",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("Error in Update Password API:", error);
    res.status(500).send({
      success: false,
      message: "Error in Update Password API!",
      error: error.message,
    });
  }
};

// Reset Password
const resetPasswordController = async (req, res) => {
  try {
    const { email, newPassword, answer } = req.body;
    if (!email || !newPassword || !answer) {
      return res.status(400).send({
        success: false,
        message: "Email, new password, and answer are required",
      });
    }

    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found or invalid answer",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error in Reset Password API:", error);
    res.status(500).send({
      success: false,
      message: "Error in Reset Password API!",
      error: error.message,
    });
  }
};

// Delete Profile Account
const deleteProfileController = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.log("Error in Delete Profile API:", error);
    res.status(500).send({
      success: false,
      message: "Error in Delete Profile API!",
      error: error.message,
    });
  }
};

module.exports = {
  getUserController,
  updateUserController,
  updatePasswordController,
  resetPasswordController,
  deleteProfileController,
};
