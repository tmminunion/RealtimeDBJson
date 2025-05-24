const fs = require("fs");
const path = require("path");

const PERMISSION_DIR = path.join(__dirname, "../permissions");

function ensurePermissionDirExists() {
  if (!fs.existsSync(PERMISSION_DIR)) {
    fs.mkdirSync(PERMISSION_DIR, { recursive: true });
  }
}

function getPermissionFilePath(filename) {
  if (filename.match(/\.\.|\/|\\/)) {
    throw new Error("Invalid filename");
  }
  return path.join(PERMISSION_DIR, `${filename}.json`);
}

function createDefaultPermissionFile(filename) {
  try {
    ensurePermissionDirExists();
    const filePath = getPermissionFilePath(filename);

    if (!fs.existsSync(filePath)) {
      const defaultPermissions = {
        read: true,
        write: false,
      };
      fs.writeFileSync(
        filePath,
        JSON.stringify(defaultPermissions, null, 2),
        "utf-8"
      );
    }
  } catch (err) {
    console.error(`Error creating permission file for ${filename}:`, err);
  }
}

function deletePermissionFile(filename) {
  try {
    const filePath = getPermissionFilePath(filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    } else {
      return { success: false, error: "Permission file not found" };
    }
  } catch (err) {
    console.error(`Error deleting permission file for ${filename}:`, err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  createDefaultPermissionFile,
  deletePermissionFile,
};
