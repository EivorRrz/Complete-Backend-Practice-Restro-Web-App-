const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    // Get Token from Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        success: false,
        message: "Authorization token is missing or invalid",
      });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          success: false,
          message: "Token is not valid",
        });
      }

      // Attach user ID to the request body for further use
      req.body.id = decoded.id;
      next();
    });
  } catch (error) {
    console.error(error);
    res.status(401).send({
      success: false,
      message: "Token is not provided",
      error,
    });
  }
};
