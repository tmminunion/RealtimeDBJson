// public/db.js
class RealtimeDB {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.socket = null;
    this.listeners = {};
    this.dataCallbacks = {};
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(this.wsUrl);

    this.socket.onopen = () => {
      console.log("🟢 WebSocket connected");
      Object.keys(this.listeners).forEach((path) => {
        this.subscribe(path);
      });
    };

    this.socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "update" && this.listeners[msg.path]) {
          this.listeners[msg.path].forEach((callback) => callback(msg.data));
        }

        if (msg.type === "data" && this.dataCallbacks[msg.path]) {
          this.dataCallbacks[msg.path].forEach((callback) =>
            callback(msg.data)
          );
          delete this.dataCallbacks[msg.path];
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    this.socket.onclose = () => {
      console.warn("🔴 WebSocket disconnected. Reconnecting...");
      setTimeout(() => this.connect(), 3000);
    };
  }

  subscribe(path) {
    this.socket.send(
      JSON.stringify({
        type: "subscribe",
        path,
      })
    );
  }

  on(path, callback) {
    if (!this.listeners[path]) {
      this.listeners[path] = [];
      this.subscribe(path);
    }
    this.listeners[path].push(callback);
  }

  get(path, callback) {
    if (!this.dataCallbacks[path]) {
      this.dataCallbacks[path] = [];
    }
    this.dataCallbacks[path].push(callback);
    this.socket.send(
      JSON.stringify({
        type: "get",
        path,
      })
    );
  }

  set(path, data) {
    this.socket.send(
      JSON.stringify({
        type: "set",
        path,
        data,
      })
    );
  }

  update(path, data) {
    this.socket.send(
      JSON.stringify({
        type: "update",
        path,
        data,
      })
    );
  }

  delete(path) {
    this.socket.send(
      JSON.stringify({
        type: "delete",
        path,
      })
    );
  }
}

// For CDN usage
if (typeof window !== "undefined") {
  window.RealtimeDB = RealtimeDB;
}
