const express = require("express");
const router = express.Router();
const fs = require("fs");
router.get("/", (req, res) => {
  try {
    if (!fs.existsSync("data")) fs.mkdirSync("data");
    const files = fs.readdirSync("data").filter((f) => f.endsWith(".json"));

    const paths = files.map((f) => {
      try {
        const content = fs.readFileSync(path.join("data", f), "utf8");
        const data = JSON.parse(content);
        return {
          name: f.replace(".json", ""),
          count: Object.keys(data).length,
          size: Buffer.byteLength(content, "utf8"),
        };
      } catch (e) {
        console.error(`Error reading ${f}:`, e);
        return {
          name: f.replace(".json", ""),
          error: "Invalid JSON",
        };
      }
    });

    res.json({ success: true, data: paths });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Failed to read paths",
      details: e.message,
    });
  }
});

module.exports = router;
