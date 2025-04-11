require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth/AuthRoutes");
const adminProductsRouter = require('./routes/admin/productRoutes');
const shopProductsRouter = require('./routes/shop/shopProductRoutes');
const CartRouter = require('./routes/shop/CartRoutes');
const AddressRouter = require('./routes/shop/addressRoutes');
const shopOrderRouter = require('./routes/shop/orderRoutes');
const adminOrderRouter = require('./routes/admin/adminOrderRoutes');
const shopSearchRouter = require('./routes/shop/searchRoutes');
const reviewRouter = require('./routes/shop/reviewRoutes');
const commonFeatureRouter = require('./routes/common/featureRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const isProduction = process.env.NODE_ENV === 'production';
const CLIENT_URL = isProduction ? process.env.CLIENT_URL_PROD : process.env.CLIENT_URL_DEV;


mongoose
  .connect(
    process.env.DB_URL
    )
  .then(() => console.log("Database connected"))
  .catch((error) => console.log("Error connecting to DB:", error));

app.use(
  cors({
    origin: [CLIENT_URL],
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
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/products", shopProductsRouter);
app.use("/api/cart", CartRouter);
app.use("/api/address", AddressRouter);
app.use("/api/orders", shopOrderRouter);
app.use("/api/search", shopSearchRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/common/features", commonFeatureRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
