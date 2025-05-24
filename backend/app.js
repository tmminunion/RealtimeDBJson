require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const jsonFilesRouter = require("./routes/jsonFiles");
const jsonPermit = require("./routes/jsonPermit");
const authRouter = require("./routes/auth");
const authenticateToken = require("./middleware/auth");
const jsonFilesCreate = require("./routes/jsonCreate");
const jsonFilesData = require("./routes/data");
const apiKeysRouter = require("./routes/apiKeys"); // Add this line

const app = express();

// View engine setup for API keys management
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// Routes

app.use("/api/files", authenticateToken, jsonFilesRouter);
app.use("/api/permit", authenticateToken, jsonPermit);
app.use("/api/create", authenticateToken, jsonFilesCreate);
app.use("/api/data", jsonFilesData);
app.use("/auth", authRouter);
app.use("/api/keys", authenticateToken, apiKeysRouter); // Add this line for API keys management

// Frontend routes
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/editor", (_, res) => res.sendFile(path.join(__dirname, "public/editor.html")));
app.get("/editor_permission", (_, res) => res.sendFile(path.join(__dirname, "public/editor_permission.html")));
app.get(["/list", "/dashboard"], (_, res) => res.sendFile(path.join(__dirname, "public/list.html")));
app.get("/chat", (_, res) => res.sendFile(path.join(__dirname, "public/chat.html")));
app.get("/api-keys", (_, res) => { // Add this route for the UI
  res.render('apiKeys/index');
});

app.get("/config.js", (req, res) => {
  res.type("application/javascript");
  res.send(`window.CONFIG = {
    WSS_URL: "${process.env.WSS_URL}"
  };`);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

module.exports = app;