module.exports = {
  apps: [{
    name: "Nudb",
    script: "./server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: "production"
    }
  }]
}