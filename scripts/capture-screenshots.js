const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = require('../app');

const PORT = 3099;
const ARTIFACT_DIR = 'C:\\Users\\rohit\\.gemini\\antigravity\\brain\\55cc7c39-8808-47bb-a8b5-9bc484b92fa1';
const CHROME_PATH = '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';

async function capture() {
  console.log('Starting server on port', PORT);
  const server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 2000));

  const desktopScreenshot = path.join(ARTIFACT_DIR, 'homepage_desktop_1366.png');
  const mobileScreenshot = path.join(ARTIFACT_DIR, 'homepage_mobile_375.png');

  console.log('Capturing desktop screenshot at 1366x768...');
  const desktopCmd = `${CHROME_PATH} --headless=new --disable-gpu --window-size=1366,850 --hide-scrollbars --screenshot="${desktopScreenshot}" http://localhost:${PORT}/`;
  try {
    execSync(desktopCmd, { stdio: 'inherit' });
    console.log('Desktop screenshot saved:', desktopScreenshot);
  } catch (e) {
    console.error('Failed to capture desktop screenshot:', e.message);
  }

  console.log('Capturing mobile screenshot at 375x812...');
  const mobileCmd = `${CHROME_PATH} --headless=new --disable-gpu --window-size=375,812 --hide-scrollbars --screenshot="${mobileScreenshot}" http://localhost:${PORT}/`;
  try {
    execSync(mobileCmd, { stdio: 'inherit' });
    console.log('Mobile screenshot saved:', mobileScreenshot);
  } catch (e) {
    console.error('Failed to capture mobile screenshot:', e.message);
  }

  server.close(() => {
    console.log('Capture complete. Server closed.');
    process.exit(0);
  });
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
