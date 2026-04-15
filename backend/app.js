require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const jsonFilesRouter = require("./routes/jsonFiles");
const jsonPermit = require("./routes/jsonPermit");
const authRouter = require("./routes/auth");
const authenticateToken = require("./middleware/auth");
const jsonFilesCreate = require("./routes/jsonCreate");
const jsonFilesData = require("./routes/data");
const apiKeysRouter = require("./routes/apiKeys"); // Add this line
const datajson = require("./routes/datajson");
const apiV1Router = require("./routes/apiV1Router");
const app = express();
const fs = require("fs");
const { exec } = require("child_process");
// View engine setup for API keys management
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key, x-csrf-token"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Routes

app.use("/api/files", authenticateToken, jsonFilesRouter);
app.use("/api/permit", authenticateToken, jsonPermit);
app.use("/api/create", authenticateToken, jsonFilesCreate);
app.use("/api/data", jsonFilesData);
app.use("/api/v1", apiV1Router);
app.use("/data", datajson);

app.use("/auth", authRouter);
app.use("/api/keys", authenticateToken, apiKeysRouter); // Add this line for API keys management

// Frontend routes
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/editor", (_, res) => res.sendFile(path.join(__dirname, "public/editor.html")));
app.get("/editor_permission", (_, res) => res.sendFile(path.join(__dirname, "public/editor_permission.html")));
app.get(["/list", "/dashboard"], (_, res) => res.sendFile(path.join(__dirname, "public/list.html")));
app.get("/chat", (_, res) => res.sendFile(path.join(__dirname, "public/chat.html")));
app.get("/api-keys", (_, res) => { // Add this route for the UI
  res.render('apiKeys/index');
});

app.get("/config.js", (req, res) => {
  res.type("application/javascript");
  res.send(`window.CONFIG = {
    WSS_URL: "${process.env.WSS_URL}"
  };`);
});



app.post("/api/install", authenticateToken, (req, res) => {
  const { package: pkgName } = req.body;
  
  // Kita jalankan npm install langsung di dalam container
  // Tidak perlu sudo karena user di dalam container biasanya sudah root/high privilege
  exec(`npm install ${pkgName}`, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: error.message });
    
    res.json({ 
      success: true, 
      message: `Package ${pkgName} berhasil dipasang!` 
    });
  });
});
// ================= DEPLOY =================
app.post("/deploy", authenticateToken, (req, res) => {
  const { name, code } = req.body;

  if (!name || !code) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const filePath = path.join(__dirname, "functions", `${name}.js`);

  fs.writeFileSync(filePath, code);

  res.json({
    success: true,
    message: `Function ${name} deployed`,
  });
});

// ================= FUNCTIONS LIST =================
app.get("/functions-list", authenticateToken, (req, res) => {
  const functionsPath = path.join(__dirname, "functions");

  const files = fs.readdirSync(functionsPath)
    .filter(f => f.endsWith(".js"))
    .map(file => {
      const code = fs.readFileSync(path.join(functionsPath, file), "utf-8");

      return {
        name: file.replace(".js", ""),
        code
      };
    });

  res.json({
    success: true,
    functions: files
  });
});

app.get("/functions-meta", authenticateToken, (req, res) => {
  const functionsPath = path.join(__dirname, "functions");

  const files = fs.readdirSync(functionsPath)
    .filter(f => f.endsWith(".js"))
    .map(file => {
      const fullPath = path.join(functionsPath, file);
      const stat = fs.statSync(fullPath);

      return {
        name: file.replace(".js", ""),
        updated: stat.mtime
      };
    });

  res.json({ success: true, functions: files });
});

app.get("/function/:name", authenticateToken, (req, res) => {
  const filePath = path.join(__dirname, "functions", `${req.params.name}.js`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Function not found" });
  }

  const code = fs.readFileSync(filePath, "utf-8");

  res.json({
    success: true,
    name: req.params.name,
    code
  });
});

app.delete("/functions/:name", authenticateToken, (req, res) => {
  try {
    const { name } = req.params;

    const filePath = path.join(__dirname, "functions", `${name}.js`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "Function tidak ditemukan",
      });
    }

    fs.unlinkSync(filePath);

    console.log("🗑️ Deleted:", filePath);

    res.json({
      success: true,
      message: `Function ${name} deleted`,
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.get("/db/:name", authenticateToken, (req, res) => {
  try {
    const { name } = req.params;

    const filePath = path.join(__dirname, "data", `${name}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "DB not found",
      });
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.post("/db/:name", authenticateToken, (req, res) => {
  try {
    const { name } = req.params;
    const data = req.body;

    const dir = path.join(__dirname, "data");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${name}.json`);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: `DB ${name} updated`,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
// ✅ FIX CONFIG.JS
app.get("/config.js", (req, res) => {
  res.type("application/javascript");
  res.send(`
    window.CONFIG = {
      WSS_URL: "${process.env.WSS_URL}"
    };
  `);
});

// ================= FaaS SYSTEM =================

const functionsPath = path.join(__dirname, "functions");
// ================= DYNAMIC FaaS SYSTEM =================
// Menangkap semua request ke /functions/apapun-namanya
app.all("/functions/:name", async (req, res) => {
  const functionName = req.params.name;
  const functionPath = path.join(__dirname, "functions", `${functionName}.js`);

  // 1. Cek apakah file fungsinya ada
  if (!fs.existsSync(functionPath)) {
    return res.status(404).json({ 
      success: false, 
      error: `Function '${functionName}' tidak ditemukan.` 
    });
  }

  try {
    // 2. Hapus cache agar selalu membaca kode terbaru setelah deploy
    delete require.cache[require.resolve(functionPath)];
    const fn = require(functionPath);

    // 3. Logic Auth (sama seperti kode lama kamu)
    const execute = async () => {
      try {
        await fn(req, res);
      } catch (runErr) {
        res.status(500).json({ error: runErr.message });
      }
    };

    if (fn.auth) {
      return authenticateToken(req, res, async () => {
        if (fn.role && req.user.role !== fn.role) {
          return res.status(403).json({ error: "Forbidden" });
        }
        await execute();
      });
    }

    // 4. Jalankan jika public
    await execute();

  } catch (err) {
    console.error("FaaS Execution Error:", err);
    res.status(500).json({ error: "Gagal memuat function: " + err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

module.exports = app;