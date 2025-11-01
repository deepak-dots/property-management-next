// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const path = require('path');
// const cors = require('cors');

// const propertyRoutes = require('./routes/property');
// const adminRouter = require('./routes/adminRoutes');
// const userRouter = require('./routes/userRoutes');
// const quotesRouter = require('./routes/propertyQuotesForm'); // Quotes routes
// const cloudinary = require("./utils/cloudinary");
// const pageRoutes = require('./routes/page');
// const favoritesRouter = require('./routes/favorites');

// const app = express();
// const PORT = process.env.PORT || 3000;
// const MONGO_URI = process.env.MONGO_URI;

// const resendEmail = require('./utils/resendEmail');

// // ------------------ Connect MongoDB ------------------
// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// // ------------------ CORS configuration ------------------
// const allowedOrigins = [
//   "http://localhost:3000", 
//   "https://property-management-frontend-alpha.vercel.app",
//   "https://property-management-frontend-rnk74c91c.vercel.app"
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true); // allow Postman or server requests
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = `CORS error: This site ${origin} is not allowed.`;
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   credentials: true,
// }));

// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ------------------ Cloudinary Test ------------------
// app.get("/test-cloudinary", async (req, res) => {
//   try {
//     const result = await cloudinary.api.ping();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// // ------------------ Email Test Route ------------------
// app.post('/api/test-email', async (req, res) => {
//   try {
//     const { to, subject, text } = req.body;

//     if (!to) {
//       return res.status(400).json({ error: 'Recipient email required' });
//     }

//     const result = await resendEmail({ to, subject, text });
//     res.status(200).json({ message: '✅ Email sent successfully!', result });
//   } catch (error) {
//     console.error('❌ Email error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // ------------------ Routes ------------------
// //app.use('/api/favorites', favoritesRouter);
// app.use('/api/pages', pageRoutes);
// app.use('/api/user', userRouter);

// // **Admin routes for signup/login & protected routes**
// app.use('/api/admin', adminRouter);

// app.use('/api/properties', propertyRoutes);
// app.use("/api/quotes", quotesRouter); // Quotes routes with optional auth

// // ------------------ Root ------------------
// app.get('/', (req, res) => {
//   res.send('Property API running');
// });

// // ------------------ Start server ------------------
// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


// api/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dbConnect from "../lib/dbConnect.js";

// ✅ Import routes
// import authRoutes from "../routes/authRoutes.js";
// import propertyRoutes from "../routes/propertyRoutes.js";

// ✅ Setup directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
dbConnect();

// ✅ Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/properties", propertyRoutes);

// ✅ Test route
app.get("/api/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


