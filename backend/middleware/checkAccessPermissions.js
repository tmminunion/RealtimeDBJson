const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const db = require("../DB"); // file helper koneksi mysql

async function isValidCsrfToken(token) {
  try {
    // 1. Cek ke database
    const [rows] = await db.execute("SELECT * FROM csrf_tokens WHERE token = ? AND expires_at > NOW()", [token]);
    if (rows.length > 0) return true;

    // 2. Fallback ke file JSON
    const csrfPath = path.join(__dirname, "../auth/tokens.json");
    if (fs.existsSync(csrfPath)) {
      const json = JSON.parse(fs.readFileSync(csrfPath, "utf-8"));
      return (json.tokens || []).includes(token);
    }

    return false;
  } catch (err) {
    console.error("CSRF validation error:", err);
    return false;
  }
}

function checkAccessPermissions(action) {
  return async function (req, res, next) {
    const { filename } = req.params;
    const permissionsPath = path.join(
      __dirname,
      "../permissions",
      `${filename}.json`
    );
    const apiKeysPath = path.join(__dirname, "../auth/apikeys.json");

    if (!fs.existsSync(permissionsPath)) {
      return res.status(404).json({ error: "Permission file not found" });
    }

    try {
      const permissions = JSON.parse(fs.readFileSync(permissionsPath, "utf-8"));
      const permissionValue = permissions[action];

      if (permissionValue === undefined) {
        return res.status(400).json({ error: `Missing ${action} permission flag` });
      }

      if (permissionValue === true) return next(); // Public access

      // 1. Bearer Token
      const authHeader = req.headers["authorization"];
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

      if (token) {
        return jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
          if (err) return res.sendStatus(403);
          req.user = user;
          return next();
        });
      }

      // 2. API Key
      if (fs.existsSync(apiKeysPath)) {
        const apiKey = req.headers["x-api-key"] || req.query.apikey;
        const storedKeys = JSON.parse(fs.readFileSync(apiKeysPath, "utf-8")).keys || [];
        const isValidKey = storedKeys.some((entry) => entry.key === apiKey);
        if (isValidKey) return next();
      }

      // 3. CSRF Token (DB or JSON)
      const csrfToken = req.headers["x-csrf-token"];
      if (csrfToken && await isValidCsrfToken(csrfToken)) return next();

      // 4. Gagal semua
      return res.status(401).json({ error: "Unauthorized" });
    } catch (err) {
      console.error("Permission check error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}

module.exports = checkAccessPermissions;