const fs = require("fs");
const path = require("path");
const DATA_DIR = path.join(__dirname, "../data");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function getFilePath(dataPath) {
  const parts = dataPath.split("/");
  const category = parts[0];
  return path.join(DATA_DIR, `${category}.json`);
}

function loadDataFile(filePath) {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error("Error loading data file:", err);
  }
  return {};
}

function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Error saving data file:", err);
    return false;
  }
}

function getNestedProperty(obj, path) {
  const parts = path.split("/").slice(1);
  return parts.reduce((o, key) => (o?.[key] !== undefined ? o[key] : undefined), obj);
}

function setNestedProperty(obj, path, value) {
  const parts = path.split("/").slice(1);
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
  return obj;
}

module.exports = {
  getFilePath,
  loadDataFile,
  saveData,
  getNestedProperty,
  setNestedProperty
};