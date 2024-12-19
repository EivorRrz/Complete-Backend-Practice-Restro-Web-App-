
const userModel = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    // Find user by ID
    const user = await userModel.findById(req.body.id);
    
    // Check if user is admin
    if (user.userType !== "admin") {
      
      return res.status(401).send({
        success: false,
        message: "Only Admin users are allowed to access this resource",
      });
    } else {
      // next middleware
      next();
    }
  } catch (error) {
    // Log and respond with 500 if error occurs
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Admin Authorization",
      error,
    });
  }
};
