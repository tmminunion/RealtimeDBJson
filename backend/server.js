const http = require("http");
const app = require("./app");
const { handleWebSocket, broadcastToSubscribers } = require("./services/websocketHandler");
const pm2 = require('pm2');
const PORT = process.env.PORT || 8008;
const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});

handleWebSocket(server);

// --- INJEKSI PM2 DI SINI ---
pm2.connect((err) => {
  if (err) {
    console.error('❌ PM2 Connect Error:', err);
    return;
  }

  pm2.launchBus((err, bus) => {
    if (err) {
      console.error('❌ PM2 Bus Error:', err);
      return;
    }

    console.log('📡 PM2 Log Stream Active - Broadcasting to /logs/in');

    // Tangkap log standar
   // Ganti bagian bus.on di server.js kamu jadi begini:
bus.on('log:out', (data) => {
    // Kita hapus filter "if name === 'Nudb'" sementara untuk tes
    console.log("Cek log PM2:", data.data); // Cek di terminal docker muncul gak
    broadcastToSubscribers('/logs/in', {
        type: 'stdout',
        msg: data.data,
        time: Date.now()
    });
});

    // Tangkap log error
    bus.on('log:err', (data) => {
      if (data.process.name === 'Nudb') {
        broadcastToSubscribers('/logs/in', {
          type: 'stderr',
          msg: data.data,
          time: Date.now()
        });
      }
    });
  });
});