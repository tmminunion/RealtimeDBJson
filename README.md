# RealtimeDB Class Documentation

## 🧩 Overview

The `RealtimeDB` class provides a WebSocket-based real-time database with support for listening to data updates, retrieving data, and managing data
with unique IDs.

---

## 📦 Usage

### 1. **Initialize the Class**

```javascript
const db = new RealtimeDB("ws://your-websocket-url");
```

---

## 🔧 Methods

### 1. **WebSocket Connection**

```javascript
db.connect();
```

- Connects to the WebSocket server.
- Handles:
  - `onopen`: Processes queued messages and resubscribes listeners.
  - `onmessage`: Processes incoming messages (`update`, `data`, `get`, `set`, `delete`).
  - `onclose`: Reconnects after disconnection.

---

### 2. **Data Management**

#### `subscribe(path)`

```javascript
db.subscribe("data/123");
```

- Subscribes to a specific path (e.g., `data/123`).
- Automatically sends a `subscribe` message when the connection is open.

#### `on(path, callback)`

```javascript
db.on("data/123", (data) => console.log("Received data:", data));
```

- Registers a callback for a specific path.
- Equivalent to `db.listeners[path].push(callback)`.

#### `get(path, callback)`

```javascript
db.get("data/123", (data) => console.log("Retrieved data:", data));
```

- Retrieves data for a specific path.
- Sends a `get` message to the server.

#### `set(path, data)`

```javascript
db.set("data/123", { value: 42 });
```

- Sets data for a specific path.
- Sends a `set` message to the server.

#### `push(path, data)`

```javascript
const id = db.push("data/123", { value: 42 });
console.log("Data pushed with ID:", id);
```

- Creates a unique ID and stores data with it.
- Returns the ID for later use.

#### `update(path, data)`

```javascript
db.update("data/123", { value: 42 });
```

- Updates data for a specific path.
- Sends an `update` message to the server.

#### `delete(path)`

```javascript
db.delete("data/123");
```

- Deletes data for a specific path.
- Sends a `delete` message to the server.

---

### 3. **Message Handling**

- **`update`**: Updates data in the server.
- **`data`**: Retrieves data for a path.
- **`get`**: Retrieves data for a path.
- **`set`**: Sets data for a path.
- **`push`**: Creates a new ID and stores data.
- **`delete`**: Removes data from the server.

---

### 4. **Queue Mechanism**

- Messages are queued when the WebSocket is disconnected.
- Replayed when the connection is re-established.

---

### 5. **Unique ID Generation**

```javascript
const id = db._generateId();
```

- Generates a unique ID using a combination of random characters and timestamp.
- Example: `1234567890abcdef1234567890`

---

## 📝 Example Usage

```javascript
const db = new RealtimeDB("ws://your-websocket-url");

// Subscribe to a path
db.subscribe("data/123");

// Listen for updates
db.on("data/123", (data) => {
  console.log("Received update:", data);
});

// Retrieve data
db.get("data/123", (data) => {
  console.log("Retrieved data:", data);
});

// Set data
db.set("data/123", { value: 42 });

// Push data with ID
const id = db.push("data/123", { value: 42 });
console.log("Data ID:", id);

// Update data
db.update("data/123", { value: 42 });

// Delete data
db.delete("data/123");
```

---

## 📝 Notes

- **WebSocket Reconnect**: The class automatically reconnects after a disconnection.
- **Message Parsing**: Handles `JSON.parse` errors gracefully.
- **Queueing**: Messages are queued and replayed on reconnection.
- **Unique IDs**: IDs are generated with a fixed character set for predictability.

---

## 🧪 Testing

- Ensure WebSocket server is running (`ws://your-websocket-url`).
- Test with `console.log` and `console.error` for debugging.

---

## 📚 References

- WebSocket API
- JSON message parsing
- Event-driven architecture

---
