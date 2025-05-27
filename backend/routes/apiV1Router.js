const express = require("express");
const Nudb = require("nudbclient");
const checkAccessPermissions = require("../middleware/checkAccessPermissions");

const router = express.Router();
const nudb = new Nudb(process.env.WSS_URL || "ws://localhost:3030");

// Helper untuk ambil path array
const extractPath = (params) => {
  return ["satu", "dua", "tiga", "empat", "lima", "enam", "tujuh"]
    .map((k) => params[k])
    .filter(Boolean);
};

// Daftar semua rute hingga 7 segmen
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
  const fullPath = `${filename}/${pathArray.join("/")}`;

  nudb.get(fullPath, (data) => {
    if (data === undefined) {
      return res.status(404).json({ error: "Path not found" });
    }
    res.json({ success: true, value: data });
  });
});

// POST
router.post(jsonRoute, checkAccessPermissions("write"), (req, res) => {
  const { filename } = req.params;
  const pathArray = extractPath(req.params);
  const fullPath = `${filename}/${pathArray.join("/")}`;
  const data = req.body;

  nudb.set(fullPath, data);
  res.json({ success: true, path: fullPath, value: data });
});

// PUT
router.put(jsonRoute, checkAccessPermissions("write"), (req, res) => {
  const { filename } = req.params;
  const pathArray = extractPath(req.params);
  const fullPath = `${filename}/${pathArray.join("/")}`;
  const data = req.body;

  nudb.update(fullPath, data);
  res.json({ success: true, path: fullPath, value: data });
});

// DELETE
router.delete(jsonRoute, checkAccessPermissions("write"), (req, res) => {
  const { filename } = req.params;
  const pathArray = extractPath(req.params);
  const fullPath = `${filename}/${pathArray.join("/")}`;

  nudb.delete(fullPath);
  res.json({ success: true, path: fullPath });
});

module.exports = router;