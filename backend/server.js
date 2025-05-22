const http = require("http");
const app = require("./app");
const handleWebSocket = require("./services/websocketHandler");

const PORT = 8008;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});

handleWebSocket(server);