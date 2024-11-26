const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth/AuthRoutes");
const adminProductsRouter = require("./routes/admin/productRoutes");
const shopProductsRouter = require("./routes/shop/shopProductRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

mongoose
  .connect(
    "mongodb+srv://hakheem67:Hakheem%40Hector@east-side.vxhfe.mongodb.net/east-side"
  )
  .then(() => console.log("Database connected"))
  .catch((error) => console.log("Error connecting to DB:", error));

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.options("*", cors());

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/products", shopProductsRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
