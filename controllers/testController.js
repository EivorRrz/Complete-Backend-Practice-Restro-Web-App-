const testUserController = (req, res) => {
  try {
    res.status(200).send("<h1>Test user Data</h1>");
  } catch (error) {
    console.log("Error in Test API:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while processing the request.",
      error: error.message,
    });
  }
};

module.exports = { testUserController };
