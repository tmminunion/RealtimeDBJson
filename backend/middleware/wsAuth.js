const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

function checkWsAccess(type, data, headers = {}) {
  
  const segments = data.path.split("/").filter(Boolean);
  const filename = segments[0];
  const permissionsPath = path.join(__dirname, "../permissions", `${filename}.json`);
  const apiKeysPath = path.join(__dirname, "../auth/apikeys.json");

  if (!fs.existsSync(permissionsPath)) {
    console.log("true");
    return { authorized: true };
  }

  try {
    const permissions = JSON.parse(fs.readFileSync(permissionsPath, "utf-8"));
    const allowed = permissions[type];
console.log("rules", allowed);
    if (allowed === true) return { authorized: true };

    // Try Bearer Token
    const authHeader = headers["authorization"] || headers["Authorization"];
    
    console.log("rules header", authHeader);
    
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return { authorized: true, user };
      } catch (err) {
        return { authorized: false, error: "Invalid token" };
      }
    }

    // Try API Key
    const apiKey = headers["x-api-key"] || headers["X-API-KEY"];
    console.log("rules header api key ", apiKey);
    if (!fs.existsSync(apiKeysPath)) {
      return { authorized: false, error: "API key file not found" };
    }

    const storedKeys = JSON.parse(fs.readFileSync(apiKeysPath, "utf-8")).keys || [];
    const isValid = storedKeys.some((entry) => entry.key === apiKey);
    return isValid
      ? { authorized: true }
      : { authorized: false, error: "Unauthorized" };
  } catch (err) {
    return { authorized: false, error: "Permission error" };
  }
}

module.exports = checkWsAccess;