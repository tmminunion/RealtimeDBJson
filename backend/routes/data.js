const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const checkAccessPermissions = require("../middleware/checkAccessPermissions");

// Utility function to read/write data
const dataPath = (filename) =>
  path.join(__dirname, "../data", `${filename}.json`);

router.get("/:filename", checkAccessPermissions("read"), (req, res) => {
  const filePath = dataPath(req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error reading file" });
  }
});

router.post("/:filename", checkAccessPermissions("write"), (req, res) => {
  const filePath = dataPath(req.params.filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), "utf-8");
    res.json({ success: true, message: "Data saved" });
  } catch (err) {
    res.status(500).json({ error: "Error saving file" });
  }
});

router.put("/:filename", checkAccessPermissions("write"), (req, res) => {
  const filePath = dataPath(req.params.filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), "utf-8");
    res.json({ success: true, message: "Data updated" });
  } catch (err) {
    res.status(500).json({ error: "Error updating file" });
  }
});

router.delete("/:filename", checkAccessPermissions("write"), (req, res) => {
  const filePath = dataPath(req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: "File deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting file" });
  }
});

module.exports = router;
