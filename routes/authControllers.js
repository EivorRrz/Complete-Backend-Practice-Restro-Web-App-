const express = require("express");
const {
  registerController,
  loginController,
} = require("../controllers/authControllers");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//rOUTES!!

//Register!!
router.post("/register", authMiddleware, registerController);

//Login!!
router.post("/login", authMiddleware, loginController);

module.exports = router;
