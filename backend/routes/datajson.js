const express = require("express");
const router = express.Router();
const {
  readJsonFile,
  writeJsonFile,
} = require("../utils/fileManager");
const checkAccessPermissions = require("../middleware/checkAccessPermissions");

// Helper untuk mengambil path dari param
const extractPath = (params) => {
  return ['satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh']
    .map(k => params[k])
    .filter(Boolean);
};

// Helper untuk ambil value dalam json
function getDeep(obj, pathArray) {
  return pathArray.reduce((acc, key) => {
    if (acc === undefined) return undefined;
    return acc[!isNaN(key) ? parseInt(key) : key];
  }, obj);
}

// Helper untuk set value dalam json
function setDeep(obj, pathArray, value) {
  pathArray.reduce((acc, key, idx) => {
    const k = !isNaN(key) ? parseInt(key) : key;
    if (idx === pathArray.length - 1) {
      acc[k] = value;
    } else {
      if (!acc[k]) acc[k] = {};
      return acc[k];
    }
  }, obj);
}

// Helper untuk hapus value dalam json
function deleteDeep(obj, pathArray) {
  pathArray.reduce((acc, key, idx) => {
    const k = !isNaN(key) ? parseInt(key) : key;
    if (idx === pathArray.length - 1) {
      delete acc[k];
    } else {
      if (!acc[k]) return {};
      return acc[k];
    }
  }, obj);
}

// Route dasar untuk semua metode
const jsonRoute = [
  "/:filename",
  "/:filename/:satu",
  "/:filename/:satu/:dua",
  "/:filename/:satu/:dua/:tiga",
  "/:filename/:satu/:dua/:tiga/:empat",
  "/:filename/:satu/:dua/:tiga/:empat/:lima",
  "/:filename/:satu/:dua/:tiga/:empat/:lima/:enam",
  "/:filename/:satu/:dua/:tiga/:empat/:lima/:enam/:tujuh",
];

// GET
router.get(jsonRoute, checkAccessPermissions("read"), (req, res) => {
  const { filename } = req.params;
  const pathArray = extractPath(req.params);
  const json = readJsonFile(filename);

  if (!json) return res.status(404).json({ error: "File not found" });

  const value = getDeep(json, pathArray);
  if (value === undefined) {
    return res.status(404).json({ error: "Path not found in JSON" });
  }

  res.json({ value });
});

// POST / PUT
router.post(jsonRoute, checkAccessPermissions("write"), (req, res) => {
  const { filename } = req.params;
  const pathArray = extractPath(req.params);
  const data = req.body;

  let json = readJsonFile(filename) || {};
  setDeep(json, pathArray, data);

  const success = writeJsonFile(filename, json);
  if (!success) return res.status(500).json({ error: "Failed to write data" });

  res.json({ success: true, value: data });
});

// DELETE
router.delete(jsonRoute, checkAccessPermissions("write"), (req, res) => {
  const { filename } = req.params;
  const pathArray = extractPath(req.params);

  let json = readJsonFile(filename);
  if (!json) return res.status(404).json({ error: "File not found" });

  deleteDeep(json, pathArray);
  const success = writeJsonFile(filename, json);
  if (!success) return res.status(500).json({ error: "Failed to delete data" });

  res.json({ success: true });
});

module.exports = router;