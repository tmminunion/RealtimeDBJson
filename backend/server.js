const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const wss = new WebSocket.Server({ port: 8008 });
const DATA_DIR = path.join(__dirname, "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const rooms = new Map();

// Improved path handling for nested structures
function getFilePath(dataPath) {
  const parts = dataPath.split("/");
  const category = parts[0]; // First part is always the category/filename
  return path.join(DATA_DIR, `${category}.json`);
}

// Helper to set nested property
function setNestedProperty(obj, path, value) {
  const parts = path.split("/");
  let current = obj;

  for (let i = 1; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  return obj;
}

// Helper to get nested property
function getNestedProperty(obj, path) {
  const parts = path.split("/");
  let current = obj;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!current[part]) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

// Helper function to get file path from data path
function getFilePath(dataPath) {
  const [category, id] = dataPath.split("/");
  return path.join(DATA_DIR, `${category}.json`);
}

// Load or initialize data file
function loadDataFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    return {};
  } catch (err) {
    console.error("Error loading data file:", err);
    return {};
  }
}

// Save data to file
function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Error saving data file:", err);
    return false;
  }
}

function broadcast(path, data) {
  const msg = JSON.stringify({ type: "update", path, data });
  rooms.get(path)?.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

wss.on("connection", (ws) => {
  console.log("🔌 Client connected");

  ws.on("message", (msg) => {
    // Handle set operation
    let data;
    try {
      data = JSON.parse(msg);
      console.log("Received:", data);
    } catch (err) {
      console.error("❌ Invalid JSON:", err);
      return;
    }

    // Handle set operation
    if (data.type === "set" && data.path) {
      const filePath = getFilePath(data.path);
      let fileData = loadDataFile(filePath);

      // Update nested data
      fileData = setNestedProperty(fileData || {}, data.path, data.data);

      if (saveData(filePath, fileData)) {
        console.log(`💾 Saved data to ${filePath}`);

        // Broadcast update to all subscribers
        const updatedData = getNestedProperty(fileData, data.path);
        const msgToSend = JSON.stringify({
          type: "update",
          path: data.path,
          data: updatedData,
        });

        // Broadcast to exact path subscribers
        if (rooms.has(data.path)) {
          rooms.get(data.path).forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(msgToSend);
            }
          });
        }

        // Broadcast to parent path subscribers
        const parentPath = data.path.split("/").slice(0, -1).join("/");
        if (parentPath && rooms.has(parentPath)) {
          const parentData = getNestedProperty(fileData, parentPath);
          rooms.get(parentPath).forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "update",
                  path: parentPath,
                  data: parentData,
                })
              );
            }
          });
        }
      }
    }
    // Handle get operation
    if (data.type === "get" && data.path) {
      const filePath = getFilePath(data.path);
      const [category, id] = data.path.split("/");
      const fileData = loadDataFile(filePath);

      const responseData = id ? fileData[id] : fileData;

      ws.send(
        JSON.stringify({
          type: "data",
          path: data.path,
          data: responseData,
        })
      );
    }

    if (data.type === "update" && data.path) {
      const filePath = getFilePath(data.path);
      let fileData = loadDataFile(filePath);

      // Update nested data (partial update)
      const existingData = getNestedProperty(fileData, data.path) || {};
      const updatedData = { ...existingData, ...data.data }; // Merge old + new data
      fileData = setNestedProperty(fileData, data.path, updatedData);

      saveData(filePath, fileData);
      broadcast(data.path, updatedData); // Kirim update ke semua subscriber
    }

    // Handle DELETE
    if (data.type === "delete" && data.path) {
      const filePath = getFilePath(data.path);
      let fileData = loadDataFile(filePath);

      // Hapus data di path tertentu
      const parts = data.path.split("/");
      const parent = getNestedProperty(fileData, parts.slice(0, -1).join("/"));
      if (parent) delete parent[parts[parts.length - 1]];

      saveData(filePath, fileData);
      broadcast(data.path, null); // Broadcast penghapusan
    }

    // Handle subscribe
    if (data.type === "subscribe" && data.path) {
      if (!rooms.has(data.path)) {
        rooms.set(data.path, new Set());
      }
      rooms.get(data.path).add(ws);
      console.log(`✅ Subscribed to path: ${data.path}`);

      // Send current data immediately
      const filePath = getFilePath(data.path);
      const [category, id] = data.path.split("/");
      const fileData = loadDataFile(filePath);
      const currentData = id ? fileData[id] : fileData;

      ws.send(
        JSON.stringify({
          type: "data",
          path: data.path,
          data: currentData,
        })
      );
    }
  });

  ws.on("close", () => {
    rooms.forEach((clients, path) => {
      if (clients.has(ws)) {
        clients.delete(ws);
        if (clients.size === 0) {
          rooms.delete(path);
        }
      }
    });
    console.log("🔌 Client disconnected");
  });
});

console.log("🚀 WebSocket server running on ws://localhost:8008");
