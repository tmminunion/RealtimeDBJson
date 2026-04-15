const Nudb = require("nudbclient"); // dari dist/node.js

console.log("Menghubungkan ke database...");

const db = new Nudb("wss://wabot.nufat.id");

db.on("open", () => console.log("✅ Terhubung ke WebSocket!"));
db.on("error", (err) => console.error("❌ WebSocket error:", err));

db.get("messages", (data) => {
  console.log("📩 Data messages:", data);
});

db.on("messages", (data) => {
  console.log("📡 Update dari /messages:", data);
});
