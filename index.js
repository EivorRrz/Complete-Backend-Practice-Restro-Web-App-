const express = require("express");
const colors = require("colors");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDb = require("./config/db");

// Initialize dotenv configuration and database connection
dotenv.config();
connectDb();

const app = express();
const PORT = process.env.PORT || 3000; // Declare `PORT` with `const`

// Middlewares
app.use(cors({//fetching (Frontend and Backend!)
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));


// API routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/restaurant", require("./routes/restaurantRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/user", require("./routes/authControllers"))
app.use("/api/food", require("./routes/foodRoutes"))

// Listen on port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`.white.bgMagenta);
});
