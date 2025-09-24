// This file will be your new server entry point for Netlify.
// It wraps your Express app so it can run as a serverless function.

const express = require("express");
const mongoose = require("mongoose");
const serverless = require("serverless-http");
const cors = require("cors");
const router = require("../../routes/routes"); // Make sure this path is correct

require("dotenv").config();

const app = express();

// --- Database Connection ---
// It's a good practice to connect to the database outside of the handler
// to reuse the connection across multiple function invocations.
const MONGO_URI = process.env.MONGO_CONNECTION_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB");
    app.use(express.json());
    app.use(cors());

    // --- Routes ---
    // We mount the router at the base path. The /api part is handled by
    // the redirect rule in netlify.toml.
    app.use((req, res, next) => {
      console.log(req, router);
      next();
    });
    app.use("/api", router);

    // --- Export the handler ---
    // The serverless-http wrapper takes your Express app and converts it
    // into a handler that Netlify Functions can use.
  })
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// --- Middleware ---
module.exports.handler = serverless(app);
