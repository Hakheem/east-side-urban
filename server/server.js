require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

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

// environment detection 
const isProduction = process.env.NODE_ENV === 'production';
const CLIENT_URL = isProduction 
  ? process.env.CLIENT_URL_PROD 
  : process.env.CLIENT_URL_DEV;

console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`Client URL: ${CLIENT_URL}`);

// MongoDB connection 
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => {
    console.error("Error connecting to DB:", error.message);
    process.exit(1); 
  });

// CORS configuration
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"]
}));

app.options("*", cors());

app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use(session({
  name: 'eastside',
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false, 
  cookie: {
    secure: isProduction, 
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: isProduction ? 'none' : 'lax' 
  },
  store: isProduction ? undefined : new session.MemoryStore() 
}));

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    environment: isProduction ? 'production' : 'development',
    clientUrl: CLIENT_URL,
    timestamp: new Date().toISOString()
  });
});

// ✅ PayPal test endpoint
app.get('/api/paypal/test', (req, res) => {
  res.json({
    paypalMode: process.env.PAYPAL_MODE || 'not set',
    paypalClientId: process.env.PAYPAL_CLIENT_ID ? 'configured' : 'missing',
    environment: isProduction ? 'production' : 'development'
  });
});

// API Routes
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

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: isProduction ? 'Internal server error' : err.message 
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${isProduction ? 'Production' : 'Development'}`);
  console.log(`🔗 Client URL: ${CLIENT_URL}`);
  console.log(`💳 PayPal Mode: ${process.env.PAYPAL_MODE || 'not set'}`);
});
