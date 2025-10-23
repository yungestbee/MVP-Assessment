// main.js
const { app, BrowserWindow, Tray, Menu, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");
const ip = require("ip");
const { spawn } = require("child_process");
const http = require("http");

let mainWindow;
let tray;
let backendServer;
let serveProcess;

if (!app.requestSingleInstanceLock()) app.quit();

// Helper: Check if frontend is live
function checkFrontendReady(url, retries = 15, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode === 200) {
            console.log(`✅ Frontend is live at ${url}`);
            resolve(true);
          } else if (attempts < retries) {
            attempts++;
            console.log(`⏳ Waiting for frontend... (${attempts}/${retries})`);
            setTimeout(check, delay);
          } else {
            reject(new Error("Frontend did not start in time."));
          }
        })
        .on("error", () => {
          if (attempts < retries) {
            attempts++;
            console.log(`⏳ Waiting for frontend... (${attempts}/${retries})`);
            setTimeout(check, delay);
          } else {
            reject(new Error("Frontend not reachable."));
          }
        });
    };

    check();
  });
}

function createWindow(frontendURL) {
  console.log("🪟 Creating window and loading frontend...");
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(frontendURL);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function startBackend() {
  console.log("⚙️  Starting backend...");
  const createServerApp = require(path.join(__dirname, "server", "src", "app"));
  const expressApp = createServerApp();
  const PORT = process.env.PORT || 8000;

  backendServer = expressApp.listen(PORT, "0.0.0.0", () => {
    const lanIP = ip.address();
    console.log("✅ Backend running on:");
    console.log(`   → Local:  http://localhost:${PORT}`);
    console.log(`   → LAN:    http://${lanIP}:${PORT}`);
    createTray(lanIP, PORT);
  });

  backendServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `❌ Port ${PORT} is already in use. Please stop the previous server.`
      );
      app.quit();
    } else {
      console.error("❌ Backend server error:", err);
    }
  });
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    console.log("⚙️  Starting frontend with 'serve'...");
    serveProcess = spawn("npx", ["serve", "-s", "client/dist", "-l", "3000"], {
      shell: true,
      stdio: "inherit",
    });

    serveProcess.on("error", (err) => {
      console.error("❌ Failed to start frontend:", err);
      reject(err);
    });

    // Wait until frontend is actually ready
    checkFrontendReady("http://localhost:3000")
      .then(() => resolve("http://localhost:3000"))
      .catch((err) => reject(err));
  });
}

function restartBackend() {
  if (backendServer) {
    backendServer.close(() => {
      console.log("🔁 Restarting backend...");
      startBackend();
    });
  } else {
    startBackend();
  }
}

function createTray(lanIP, port) {
  const iconPath = path.join(__dirname, "assets", "icon.png");

  const trayIcon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createFromDataURL(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAOCAYAAAAvzXo1AAAAJElEQVQoU2N8+ePfPwMDA8OAEYwMQ1GxQhVDoYhWGA2gwMABACp0BHk1wM1TwAAAABJRU5ErkJggg=="
      );

  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: `Server: http://${lanIP}:${port}`, enabled: false },
    { type: "separator" },
    {
      label: "Open App",
      click: () => {
        if (!mainWindow) createWindow("http://localhost:3000");
        else mainWindow.show();
      },
    },
    {
      label: "Restart Server",
      click: restartBackend,
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        console.log("👋 Shutting down app...");
        serveProcess?.kill();
        backendServer?.close();
        app.quit();
      },
    },
  ]);

  tray.setToolTip("TCA Local Server");
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(async () => {
  try {
    startBackend();
    const frontendURL = await startFrontend();
    createWindow(frontendURL);
  } catch (err) {
    console.error("💥 Startup failed:", err.message);
    app.quit();
  }
});

app.on("window-all-closed", (e) => {
  e.preventDefault(); // keep running in tray
});

app.on("before-quit", () => {
  serveProcess?.kill();
  backendServer?.close();
});
