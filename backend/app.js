const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const jsonFilesRouter = require("./routes/jsonFiles");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.json());

app.use("/api/files", jsonFilesRouter);

app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public/list.html")));
app.get("/editor", (_, res) => res.sendFile(path.join(__dirname, "public/editor.html")));
app.get(["/list", "/dashboard"], (_, res) => res.sendFile(path.join(__dirname, "public/list.html")));
app.get("/chat", (_, res) => res.sendFile(path.join(__dirname, "public/chat.html")));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

module.exports = app;