require("dotenv").config(); // Load environment variables
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const jsonFilesRouter = require("./routes/jsonFiles");
const authRouter = require("./routes/auth");
const authenticateToken = require("./middleware/auth");



const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.json());

// CORS (opsional, kalau dari frontend berbeda origin)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// Route login
app.use("/api/login", authRouter); // public
app.use("/api/files", authenticateToken, jsonFilesRouter); // Protected

// Protected route example
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, this is protected content.` });
});
const authRouter = require("./routes/auth");
app.use("/api", authRouter);
// Public API
app.use("/api/files", jsonFilesRouter);

// Routes for frontend
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/editor", (_, res) => res.sendFile(path.join(__dirname, "public/editor.html")));
app.get(["/list", "/dashboard"], (_, res) => res.sendFile(path.join(__dirname, "public/list.html")));
app.get("/chat", (_, res) => res.sendFile(path.join(__dirname, "public/chat.html")));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

module.exports = app;