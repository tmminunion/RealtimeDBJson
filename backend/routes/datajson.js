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
// GET
router.get(jsonRoute, checkAccessPermissions("read"), (req, res) => {
  const { filename } = req.params;
  const pathArray = extractPath(req.params);
  const json = readJsonFile(filename);
  if (!json) return res.status(404).json({ error: "File not found" });

  let value = getDeep(json, pathArray);
  if (value === undefined) {
    return res.status(404).json({ error: "Path not found in JSON" });
  }

  // Deteksi apakah value adalah object collection
  if (typeof value === "object" && !Array.isArray(value)) {
    const isCollection = Object.values(value).every(
      (v) => typeof v === "object" && !Array.isArray(v)
    );

    if (isCollection) {
      value = Object.entries(value).map(([id, item]) => ({ id, ...item }));
    } else {
      return res.json({ value }); // return object/detail view
    }
  } else if (!Array.isArray(value)) {
    return res.json({ value }); // return primitive value
  }

  // Filtering
  const { where } = req.query;
  if (where) {
    const [field, val] = where.split(":");
    if (field && val !== undefined) {
      value = value.filter((item) =>
        String(item[field]).toLowerCase() === String(val).toLowerCase()
      );
    }
  }

  // Sorting
  const { sortby, order = "asc" } = req.query;
  if (sortby) {
    value.sort((a, b) => {
      const A = a[sortby], B = b[sortby];
      if (A < B) return order === "desc" ? 1 : -1;
      if (A > B) return order === "desc" ? -1 : 1;
      return 0;
    });
  }

  // Pagination
  const total = value.length;
  const limit = parseInt(req.query.limit) || total;
  const page = parseInt(req.query.page) || 1;
  const start = (page - 1) * limit;
  const paginated = value.slice(start, start + limit);

  res.json({
    value: paginated,
    meta: {
      total,
      limit,
      page,
      pages: Math.ceil(total / limit),
    },
  });
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