import ip from "ip";

export function getApiBaseUrl() {
  // Detect if running in Electron (window.electronAPI should exist)
  const isElectron = !!window.electronAPI;

  if (isElectron) {
    // Inside Electron → use host IP dynamically
    const hostIP = window.electronAPI.getHostIP?.();
    if (hostIP) {
      return `http://${hostIP}:8000`; // backend port
    }
  }

  // Normal browser mode
  // Use current hostname but force backend port 8000
  const hostname = window.location.hostname;
  return `http://${hostname}:8000`;
}

export const API_URL = getApiBaseUrl();
