const express = require("express");
const router = express.Router();
const {
  writeJsonFile,
  isValidJson,
  getJsonFiles,
  deleteJsonFile,
} = require("../utils/fileManager");

const {
  createDefaultPermissionFile,
  deletePermissionFile,
} = require("../utils/permissionManager");
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

// Tambahkan fungsi untuk nama file unik
function generateUniqueFilename(baseName) {
  const existingFiles = getJsonFiles();
  let name = baseName;
  let counter = 1;

  while (existingFiles.includes(name)) {
    name = `${baseName}_${counter}`;
    counter++;
  }

  return name;
}

router
  .route("/:filename")
  .all(validateFilename, validateJson)
  .post((req, res) => {
    const { filename } = req.params;
    const uniqueFilename = generateUniqueFilename(filename);
    const success = writeJsonFile(uniqueFilename, req.body);

    if (success) {
      createDefaultPermissionFile(uniqueFilename); // ⬅️ Tambahkan ini

      res.json({
        success: true,
        message: `Data saved to ${uniqueFilename}.json`,
        filename: uniqueFilename,
      });
    } else {
      res.status(500).json({ error: "Failed to save file" });
    }
  })
  .delete((req, res) => {
    const { filename } = req.params;

    const fileResult = deleteJsonFile(filename);
    const permissionResult = deletePermissionFile(filename);

    if (fileResult.success && permissionResult.success) {
      return res.json({
        success: true,
        message: `File ${filename}.json and permission deleted successfully.`,
      });
    }

    return res.status(500).json({
      error: "Failed to delete one or more files",
      details: {
        fileError: fileResult.error || null,
        permissionError: permissionResult.error || null,
      },
    });
  });

module.exports = router;
