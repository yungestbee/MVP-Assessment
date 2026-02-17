const { app, BrowserWindow, Tray, Menu, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");
const ip = require("ip");

let mainWindow;
let tray;
let backendServer;

// Prevent multiple instances
if (!app.requestSingleInstanceLock()) app.quit();

// Detect dev mode
const isDev = !app.isPackaged;

// -------------------- Create Main Window --------------------
function createWindow(frontendURL) {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL(frontendURL).catch((err) => {
    console.error("Failed to load frontend URL:", frontendURL, err);
  });

  // Optional: open DevTools in dev mode
  if (isDev) mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => (mainWindow = null));
}

// -------------------- Start Backend --------------------
function startBackend(port = 8000) {
  console.log(`⚙️ Starting backend on port ${port}...`);

  const createServerApp = require(path.join(__dirname, "server", "src", "app"));
  const expressApp = createServerApp();

  backendServer = expressApp.listen(port, "0.0.0.0", () => {
    const lanIP = ip.address();
    console.log(`✅ Backend running:
   → Local:  http://localhost:${port}
   → LAN:    http://${lanIP}:${port}`);

    // Always load via backend URL to avoid blank screen
    const frontendURL = `http://localhost:${port}`;
    createWindow(frontendURL);
    createTray(lanIP, port);
  });

  backendServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Port ${port} in use, trying next port...`);
      startBackend(port + 1);
    } else {
      console.error("❌ Backend server error:", err);
      app.quit();
    }
  });
}

// -------------------- Tray Icon --------------------
function createTray(lanIP, port) {
  const iconPath = path.join(
    isDev ? __dirname : process.resourcesPath,
    "assets",
    "icon.png"
  );

  const trayIcon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    : nativeImage.createEmpty();

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    { label: `Server: http://${lanIP}:${port}`, enabled: false },
    { type: "separator" },
    {
      label: "Open App",
      click: () => {
        if (!mainWindow) createWindow(`http://localhost:${port}`);
        else mainWindow.show();
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        backendServer?.close();
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Assessment Server");
  tray.setContextMenu(contextMenu);
}

// -------------------- App Lifecycle --------------------
app.whenReady().then(() => startBackend());

app.on("window-all-closed", (e) => e.preventDefault()); // stay running in tray
app.on("before-quit", () => backendServer?.close());
app.on("quit", () => backendServer?.close());
