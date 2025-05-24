const express = require("express");
const router = express.Router();
const {
  getJsonFiles,
  readJsonFile,
  writeJsonFile,
  deleteJsonFile,
  isValidJson,
} = require("../utils/fileManagerPermit");

// Middleware validasi filename
const validateFilename = (req, res, next) => {
  const { filename } = req.params;
  if (!filename || filename.match(/[^a-zA-Z0-9_-]/)) {
    return res.status(400).json({ error: "Invalid filename" });
  }
  next();
};

// Middleware validasi JSON
const validateJson = (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    if (!isValidJson(JSON.stringify(req.body))) {
      return res.status(400).json({ error: "Invalid JSON data" });
    }
  }
  next();
};

// Daftar semua file JSON
router.get("/", (req, res) => {
  try {
    const files = getJsonFiles();
    res.json(files);
  } catch (err) {
    console.error("Error getting file list:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Operasi CRUD untuk file spesifik
router
  .route("/:filename")
  .all(validateFilename, validateJson)
  .get((req, res) => {
    const { filename } = req.params;
    const data = readJsonFile(filename);

    if (data !== null) {
      res.json(data);
    } else {
      res.status(404).json({ error: "File not found or invalid" });
    }
  })
  .post((req, res) => {
    const { filename } = req.params;
    const success = writeJsonFile(filename, req.body);

    if (success) {
      res.json({ success: true, message: `Data saved to ${filename}.json` });
    } else {
      res.status(500).json({ error: "Failed to save file" });
    }
  })
  .put((req, res) => {
    const { filename } = req.params;
    const success = writeJsonFile(filename, req.body);

    if (success) {
      res.json({ success: true, message: `Data updated in ${filename}.json` });
    } else {
      res.status(500).json({ error: "Failed to update file" });
    }
  })
  .delete((req, res) => {
    const { filename } = req.params;
    const result = deleteJsonFile(filename);

    if (result.success) {
      res.json({ success: true, message: `File ${filename}.json deleted` });
    } else {
      const statusCode = result.error === "File not found" ? 404 : 500;
      res
        .status(statusCode)
        .json({ error: result.error || "Failed to delete file" });
    }
  });

module.exports = router;
