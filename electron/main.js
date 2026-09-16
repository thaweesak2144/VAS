const { app, BrowserWindow, globalShortcut, dialog } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { fork } = require('child_process');

let mainWindow = null;
let serverProcess = null;
const DEFAULT_PORT = 34567;

// Determine if we are in production packaged mode
const isProd = app.isPackaged || process.env.NODE_ENV === 'production';

// Find an available local port
function getAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(startPort, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(getAvailablePort(startPort + 1));
    });
  });
}

// Poll server until ready
function waitForServer(url, timeoutMs = 45000, logFile) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        let errDetails = '';
        try {
          if (logFile && fs.existsSync(logFile)) {
            const content = fs.readFileSync(logFile, 'utf-8');
            errDetails = '\n\nLog:\n' + content.slice(-400);
          }
        } catch (_) {}
        reject(new Error(`Server at ${url} failed to respond within ${timeoutMs}ms.${errDetails}`));
      } else {
        setTimeout(check, 400);
      }
    };

    check();
  });
}

// Initialize persistent SQLite DB in user application data (%APPDATA%/VAS Attendance System)
function prepareDatabase(appDataDir) {
  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir, { recursive: true });
  }

  const targetDbPath = path.join(appDataDir, 'vas.db');

  // If DB does not exist yet, copy initial snapshot/backup
  if (!fs.existsSync(targetDbPath)) {
    const bundledDbPath = isProd
      ? path.join(process.resourcesPath, 'prisma', 'dev.db')
      : path.join(__dirname, '..', 'prisma', 'dev.db');

    const backupDbPath = isProd
      ? path.join(process.resourcesPath, 'prisma', 'dev.db.bak')
      : path.join(__dirname, '..', 'prisma', 'dev.db.bak');

    if (fs.existsSync(bundledDbPath)) {
      fs.copyFileSync(bundledDbPath, targetDbPath);
      console.log('Copied bundled dev.db to user data:', targetDbPath);
    } else if (fs.existsSync(backupDbPath)) {
      fs.copyFileSync(backupDbPath, targetDbPath);
      console.log('Copied dev.db.bak to user data:', targetDbPath);
    }
  }

  return targetDbPath;
}

async function startServer(port, dbPath, appDataDir) {
  const env = {
    ...process.env,
    PORT: String(port),
    NODE_ENV: 'production',
    DATABASE_URL: `file:${dbPath}`,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'vas-secret-key-production-offline-app-12345',
    NEXTAUTH_URL: `http://localhost:${port}`,
  };

  let serverScript;
  if (isProd) {
    serverScript = path.join(process.resourcesPath, 'standalone', 'server.js');
  } else {
    serverScript = path.join(__dirname, '..', '.next', 'standalone', 'server.js');
  }

  if (!fs.existsSync(serverScript)) {
    throw new Error(`Standalone server script not found: ${serverScript}`);
  }

  const logFile = path.join(appDataDir, 'server.log');
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  serverProcess = fork(serverScript, [], {
    env,
    cwd: path.dirname(serverScript),
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });

  if (serverProcess.stdout) serverProcess.stdout.pipe(logStream);
  if (serverProcess.stderr) serverProcess.stderr.pipe(logStream);

  serverProcess.on('error', (err) => {
    console.error('Next.js server process error:', err);
    try { fs.appendFileSync(logFile, `Server Process Error: ${err.message}\n`); } catch (_) {}
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`Next.js server exited with code: ${code}, signal: ${signal}`);
    try { fs.appendFileSync(logFile, `Server Exited: code=${code}, signal=${signal}\n`); } catch (_) {}
  });

  return logFile;
}

async function createMainWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true,
    kiosk: true, // Kiosk mode for barcode station
    autoHideMenuBar: true,
    title: 'ระบบบันทึกเวลาและติดตามการเข้าร่วมโครงการปฏิบัติธรรม (VAS)',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = `http://localhost:${port}/admin/login`;
  console.log('Loading URL in Electron window:', startUrl);
  await mainWindow.loadURL(startUrl);

  // Keyboard shortcut: F11 to toggle Kiosk / Fullscreen
  globalShortcut.register('F11', () => {
    if (mainWindow) {
      const isKiosk = mainWindow.isKiosk();
      mainWindow.setKiosk(!isKiosk);
      mainWindow.setFullScreen(!isKiosk);
    }
  });

  // Keyboard shortcut: Ctrl+Shift+I for DevTools debugging
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  try {
    const userDataDir = app.getPath('userData');
    const dbPath = prepareDatabase(userDataDir);
    const port = await getAvailablePort(DEFAULT_PORT);

    console.log(`Starting VAS Server on port ${port} with DB: ${dbPath}`);
    const logFile = await startServer(port, dbPath, userDataDir);

    console.log('Waiting for Next.js server to be ready...');
    await waitForServer(`http://localhost:${port}/admin/login`, 45000, logFile);

    console.log('Creating Electron Kiosk window...');
    await createMainWindow(port);
  } catch (err) {
    console.error('Failed to initialize VAS application:', err);
    dialog.showErrorBox('เกิดข้อผิดพลาดในการเปิดโปรแกรม', err.message);
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});