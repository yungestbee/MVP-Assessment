// preload.js
const { contextBridge } = require("electron");
const ip = require("ip");

contextBridge.exposeInMainWorld("electronAPI", {
  getHostIP: () => ip.address(), // Expose the LAN IP
});
