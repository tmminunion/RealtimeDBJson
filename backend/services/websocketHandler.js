const WebSocket = require("ws");
const {
  getFilePath,
  loadDataFile,
  saveData,
  setNestedProperty,
  getNestedProperty,
} = require("./fileService");
const checkWsAccess = require("../middleware/wsAuth");

const rooms = new Map();

function normalizePath(path) {
  return path.replace(/^\/+|\/+$/g, ''); // hapus "/" di awal dan akhir
}

const broadcast = (path, data) => {
  const normalizedPath = normalizePath(path);
  const msg = JSON.stringify({ type: "update", path: normalizedPath, data });

  const segments = normalizedPath.split("/");
  for (let i = segments.length; i > 0; i--) {
    const subPath = segments.slice(0, i).join("/");
    if (rooms.has(subPath)) {
      
      rooms.get(subPath).forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(msg);
          console.log("📢 Broadcasting to:", subPath);
        }
      });
    }
  }
};


function handleWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("🔌 Client connected");

    ws.on("message", async (msg) => {
      
      let data;
      try {
        data = JSON.parse(msg);
      } catch (err) {
        console.error("❌ Invalid JSON:", err);
        return;
      }

// Extract headers (optional, from data.headers)
  const headers = data.headers || {};
const rules = data.type === "get" ? "read"
               : data.type === "set" ? "write"
               : data.type === "delete" ? "write"
               : data.type === "update" ? "write"
               : "read"; // default
console.log(data);
  const auth = checkWsAccess(rules, data, headers);
  if (!auth.authorized) {
    return ws.send(JSON.stringify({ error: "Unauthorized", detail: auth.error }));
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
        console.log("ada akses");
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
        const parent = getNestedProperty(
          fileData,
          parts.slice(0, -1).join("/")
        );
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
        clients.delete(ws);
        if (clients.size === 0) rooms.delete(path);
      });
      console.log("🔌 Client disconnected");
    });
  });

  

  console.log("🚀 WebSocket server running");
}



module.exports = {
  handleWebSocket,
  broadcastToSubscribers: (...args) => broadcast?.(...args), // fungsi yang bisa dipanggil dari luar
};

//module.exports = handleWebSocket;
