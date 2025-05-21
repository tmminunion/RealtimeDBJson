class RealtimeDB {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.socket = null;
    this.listeners = {};
    this.dataCallbacks = {};
    this.connect();
  }

  connect() {
    console.log(`Connecting to ${this.wsUrl}...`);
    this.socket = new WebSocket(this.wsUrl);

    this.socket.onopen = () => {
      console.log("✅ WebSocket connected");
      // Resubscribe to all paths when reconnecting
      Object.keys(this.listeners).forEach((path) => {
        this._send({ type: "subscribe", path });
      });
    };

    this.socket.onmessage = (event) => {
      console.log("📩 Message received:", event.data);
      try {
        const msg = JSON.parse(event.data);
        console.log("📦 Parsed message:", msg);

        if (msg.type === "update" && this.listeners[msg.path]) {
          console.log(`🔔 Update for ${msg.path}`, msg.data);
          this.listeners[msg.path].forEach((callback) => callback(msg.data));
        }

        if (msg.type === "data" && this.dataCallbacks[msg.path]) {
          console.log(`📊 Data response for ${msg.path}`, msg.data);
          this.dataCallbacks[msg.path].forEach((callback) =>
            callback(msg.data)
          );
          delete this.dataCallbacks[msg.path];
        }
      } catch (err) {
        console.error("❌ Error parsing message:", err);
      }
    };

    this.socket.onclose = () => {
      console.warn("🔴 WebSocket disconnected");
      setTimeout(() => this.connect(), 3000);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  on(path, callback) {
    console.log(`👂 Adding listener for ${path}`);
    if (!this.listeners[path]) {
      this.listeners[path] = [];
    }
    this.listeners[path].push(callback);

    // Subscribe to the path
    this._send({ type: "subscribe", path });
  }

  get(path, callback) {
    console.log(`📥 Requesting data for ${path}`);
    if (!this.dataCallbacks[path]) {
      this.dataCallbacks[path] = [];
    }
    this.dataCallbacks[path].push(callback);
    this._send({ type: "get", path });
  }

  set(path, data) {
    console.log(`📤 Setting data for ${path}`, data);
    this._send({
      type: "set",
      path: path,
      data: data,
    });
  }

  // Add this new method for deep paths
  setDeep(pathParts, data) {
    const path = pathParts.join("/");
    this.set(path, data);
  }
  update(path, updates) {
    this._send({
      type: "update",
      path,
      data: updates, // Hanya field yang di-update
    });
  }

  // Hapus data
  delete(path) {
    this._send({
      type: "delete",
      path,
    });
  }

  _send(data) {
    if (this.socket.readyState === WebSocket.OPEN) {
      console.log("Sending:", data);
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn(
        "Cannot send - WebSocket not ready. State:",
        this.socket.readyState
      );
      // Queue the message or handle reconnection
      setTimeout(() => this._send(data), 1000);
    }
  }
}
