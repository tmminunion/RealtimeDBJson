const Nudb = require("nudbclient"); // dari dist/node.js

const db = new Nudb("wss://nudb.nufat.id");
db.get("messages", (data) => {
  console.log(data);
});
// Dengarkan perubahan pada path "/users"
db.on("messages", (data) => {
  console.log("Data terbaru dari /users:", data);
});
