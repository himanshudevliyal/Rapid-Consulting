import puppeteer from "puppeteer";
import os from "os";

export async function launchBrowser() {
  const platform = os.platform();

  let executablePath;

  if (platform === "win32") {
    // 🪟 On Windows, use Puppeteer’s bundled Chromium
    executablePath = puppeteer.executablePath();
  } else if (platform === "linux") {
    // 🐧 On Ubuntu server (Snap install)
    executablePath = "/snap/bin/chromium";
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--no-zygote",
    ],
  });

  return browser;
}
