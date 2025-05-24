const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../permissions");

function getJsonFiles() {
  ensureDataDirExists();
  return fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(".json", ""));
}

function readJsonFile(filename) {
  try {
    const filePath = getFilePath(filename);
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}.json:`, err);
    return null;
  }
}

function writeJsonFile(filename, data) {
  try {
    ensureDataDirExists();
    const filePath = getFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}.json:`, err);
    return false;
  }
}

function deleteJsonFile(filename) {
  try {
    const filePath = getFilePath(filename);
    if (!fs.existsSync(filePath)) {
      return { success: false, error: "File not found" };
    }
    fs.unlinkSync(filePath);
    return { success: true };
  } catch (err) {
    console.error(`Error deleting ${filename}.json:`, err);
    return { success: false, error: err.message };
  }
}

function ensureDataDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(filename) {
  // Validasi nama file untuk mencegah path traversal
  if (filename.match(/\.\.|\/|\\/)) {
    throw new Error("Invalid filename");
  }
  return path.join(DATA_DIR, `${filename}.json`);
}

function isValidJson(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  getJsonFiles,
  readJsonFile,
  writeJsonFile,
  deleteJsonFile,
  isValidJson,
};
