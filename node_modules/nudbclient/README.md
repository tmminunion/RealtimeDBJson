# NuDB - Universal Realtime Database

NuDB is a lightweight realtime database that works in both Node.js and browser environments.

## Installation

```bash
npm install nudbclient
# or
yarn add nudblient
```

## Usage

### Browser
```javascript
<script src="dist/browser.js"></script>
<script>
  const db = new Nudb("ws://localhost:8008");
  db.get("/test", (data) => console.log(data));

db.on('messages', (data) => {
  console.log('New message:', data);
});

db.set('messages/123', { text: 'Hello world' });
</script>
```

### Node.js
```javascript
const Nudb = require('nudbclient'); // dari dist/node.js

const db = new Nudb("ws://localhost:8008");
db.get("/test", (data) => {
  console.log(data);
});
// Dengarkan perubahan pada path "/users"
db.on("messages", (data) => {
  console.log("Data terbaru dari /users:", data);
});
```

## API

- `new Nudb(url, options)` - Create new connection
- `setHeader(key, value)` - Set authentication headers
- `on(path, callback)` - Subscribe to data changes
- `get(path, callback)` - Get data once
- `set(path, data)` - Set data
- `push(path, data)` - Push data with auto-generated ID
- `update(path, data)` - Update existing data
- `delete(path)` - Delete data
- `close()` - Close connection