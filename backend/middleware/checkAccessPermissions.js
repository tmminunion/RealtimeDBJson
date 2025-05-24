const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

function checkAccessPermissions(action) {
  return function (req, res, next) {
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
        return res
          .status(400)
          .json({ error: `Missing ${action} permission flag` });
      }

      if (permissionValue === true) {
        return next(); // public access allowed
      }

      // --- AUTH REQUIRED BELOW ---
      // 1. Try Bearer token
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

      // 2. Try API key (from file)
      if (!fs.existsSync(apiKeysPath)) {
        return res.status(500).json({ error: "API key store not found" });
      }

      const apiKey = req.headers["x-api-key"] || req.query.apikey;
      const storedKeys =
        JSON.parse(fs.readFileSync(apiKeysPath, "utf-8")).keys || [];

      const isValidKey = storedKeys.some((entry) => entry.key === apiKey);

      if (isValidKey) return next();

      // 3. All failed
      return res
        .status(401)
        .json({ error: "Unauthorized: Invalid token or API key" });
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ error: "Error checking permissions" });
    }
  };
}

module.exports = checkAccessPermissions;
