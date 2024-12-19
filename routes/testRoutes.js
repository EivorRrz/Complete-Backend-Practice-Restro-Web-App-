const express = require("express");
const testController = require("../controllers/testController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

//api
router.get("/testUser", testController);

module.exports = router;
