'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var WebSocket$1 = require('isomorphic-ws');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket$1);

class NuDBCore {
  constructor(wsUrl, options = {}) {
    this.wsUrl = wsUrl;
    this.options = options;
    this.socket = null;
    this.listeners = {};
    this.dataCallbacks = {};
    this.queue = [];
    this.headers = options.headers || {};
    this.connect();
  }

  // ... existing code ...

  _handleMessage(data) {
    try {
      const msg = JSON.parse(data);
      if (msg.type === "update" && this.listeners[msg.path]) {
        this.listeners[msg.path].forEach(callback => callback(msg.data));
      }
      if (msg.type === "data" && this.dataCallbacks[msg.path]) {
        this.dataCallbacks[msg.path].forEach(callback => callback(msg.data));
        delete this.dataCallbacks[msg.path];
      }
    } catch (err) {
      console.error("Message handling error:", err);
    }
  }

  _handleClose() {
    console.log("WebSocket disconnected, reconnecting...");
    setTimeout(() => this.connect(), 3000);
  }

  // ... rest of your existing code ...

  _generateId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let str = "";
    for (let i = 0; i < 17; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${Date.now()}${str}`;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  sendMessage(msg) {
    const fullMsg = {
      ...msg,
      headers: this.headers,
    };

    if (this.socket?.readyState === 1) {
      this.socket.send(JSON.stringify(fullMsg));
    } else {
      this.queue.push(fullMsg);
    }
    return this;
  }

  subscribe(path) {
    this.sendMessage({ type: "subscribe", path });
    return this;
  }

  on(path, callback) {
    if (!this.listeners[path]) {
      this.listeners[path] = [];
      this.subscribe(path);
    }
    this.listeners[path].push(callback);
    return this;
  }

  get(path, callback) {
    if (!this.dataCallbacks[path]) {
      this.dataCallbacks[path] = [];
    }
    this.dataCallbacks[path].push(callback);
    this.sendMessage({ type: "get", path });
    return this;
  }

  set(path, data) {
    this.sendMessage({ type: "set", path, data });
    return this;
  }

  push(path, data) {
    const id = this._generateId();
    const fullPath = `${path}/${id}`;
    this.set(fullPath, data);
    return id;
  }

  update(path, data) {
    this.sendMessage({ type: "update", path, data });
    return this;
  }

  delete(path) {
    this.sendMessage({ type: "delete", path });
    return this;
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
    return this;
  }
}

class NuDB$2 extends NuDBCore {
  constructor(wsUrl, options = {}) {
    super(wsUrl, options);
  }

  connect() {
    this.socket = new WebSocket__default["default"](this.wsUrl);

    this.socket.on('open', () => {
      console.log("🟢 NuDB WebSocket connected");
      this._processQueue();
      this._resubscribe();
    });

    // Use arrow functions to maintain 'this' context
    this.socket.on('message', (data) => this._handleMessage(data));
    this.socket.on('close', () => this._handleClose());
    this.socket.on('error', (err) => {
      console.error("NuDB WebSocket error:", err);
    });
  }

  _processQueue() {
    while (this.queue.length > 0) {
      const action = this.queue.shift();
      this.socket.send(JSON.stringify(action));
    }
  }

  _resubscribe() {
    Object.keys(this.listeners).forEach((path) => {
      this.sendMessage({ type: "subscribe", path });
    });
  }
}

class NuDB$1 extends NuDBCore {
  constructor(wsUrl, options = {}) {
    super(wsUrl, options);
  }

  connect() {
    this.socket = new WebSocket(this.wsUrl);

    this.socket.onopen = () => {
      console.log("🟢 NuDB WebSocket connected");
      this._processQueue();
      this._resubscribe();
    };

    this.socket.onmessage = this._handleMessage.bind(this);
    this.socket.onclose = this._handleClose.bind(this);
  }

  _processQueue() {
    while (this.queue.length > 0) {
      const action = this.queue.shift();
      this.socket.send(JSON.stringify(action));
    }
  }

  _resubscribe() {
    Object.keys(this.listeners).forEach((path) => {
      this.sendMessage({ type: "subscribe", path });
    });
  }

  _handleMessage(event) {
    try {
      const msg = JSON.parse(event.data);
      console.log("📩 NuDB received:", msg);

      if (msg.type === "update" && this.listeners[msg.path]) {
        this.listeners[msg.path].forEach((callback) => callback(msg.data));
      }

      if (msg.type === "data" && this.dataCallbacks[msg.path]) {
        this.dataCallbacks[msg.path].forEach((callback) => callback(msg.data));
        delete this.dataCallbacks[msg.path];
      }
    } catch (err) {
      console.error("NuDB message parse error:", err);
    }
  }

  _handleClose() {
    console.warn("🔴 NuDB WebSocket disconnected. Reconnecting...");
    setTimeout(() => this.connect(), 3000);
  }
}

const NuDB = typeof window !== 'undefined' ? NuDB$1 : NuDB$2;

exports.NuDB = NuDB;
exports["default"] = NuDB;
//# sourceMappingURL=index.cjs.map
