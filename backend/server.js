const http = require("http");
const app = require("./app");
const {handleWebSocket }= require("./services/websocketHandler");

const PORT = process.env.PORT || 8008;
const server = http.createServer(app);

server.listen(PORT,'0.0.0.0', () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});

handleWebSocket(server);