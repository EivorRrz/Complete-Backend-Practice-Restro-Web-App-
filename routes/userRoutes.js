const express = require("express");
const {
  getUserController,
  updateUserController,
  updatePasswordController,
  resetPasswordController,
  deleteProfileController,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//Routes!!
router.get("/getUser", authMiddleware, getUserController);
router.put("/updateUser", authMiddleware, updateUserController);
router.put("/updatePassword", authMiddleware, updatePasswordController);
router.put("/resetPassword", authMiddleware, resetPasswordController);
router.delete("/deleteUser:/id", authMiddleware, deleteProfileController);
module.exports = router;
