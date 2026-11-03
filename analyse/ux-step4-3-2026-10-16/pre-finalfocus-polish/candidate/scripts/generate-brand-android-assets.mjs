import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const root = process.cwd();
const res = resolve(root, "android/app/src/main/res");
const master = await readFile(resolve(root, "brand/assets/app-icon-master.svg"), "utf8");
const foreground = await readFile(resolve(root, "brand/assets/app-icon-foreground.svg"), "utf8");
const mark = await readFile(resolve(root, "brand/assets/mark-forest.svg"), "utf8");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const browser = await chromium.launch({ headless: true, ...(existsSync(edgePath) ? { executablePath: edgePath } : {}) });
const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });

async function renderSvg(svg, path, width, height, transparent = false) {
  const sizedSvg = svg.replace("<svg ", `<svg width="${width}" height="${height}" `);
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(sizedSvg).toString("base64")}`;
  await page.setViewportSize({ width, height });
  await page.setContent(`<html><body style="margin:0;width:${width}px;height:${height}px;background:transparent"><img src="${dataUrl}" width="${width}" height="${height}" style="display:block" /></body></html>`);
  await page.locator("img").waitFor({ state: "visible" });
  await page.locator("img").screenshot({ path, omitBackground: transparent, animations: "disabled" });
}

const densities = [
  ["mdpi", 1], ["hdpi", 1.5], ["xhdpi", 2], ["xxhdpi", 3], ["xxxhdpi", 4],
];
for (const [density, scale] of densities) {
  const mipmap = resolve(res, `mipmap-${density}`);
  const launcherSize = 48 * scale;
  const foregroundSize = 108 * scale;
  await renderSvg(master, resolve(mipmap, "ic_launcher.png"), launcherSize, launcherSize);
  await renderSvg(master, resolve(mipmap, "ic_launcher_round.png"), launcherSize, launcherSize);
  await renderSvg(foreground, resolve(mipmap, "ic_launcher_foreground.png"), foregroundSize, foregroundSize, true);
}

const splashFiles = [
  ["drawable/splash.png", 480, 320, 1],
  ["drawable-land-mdpi/splash.png", 480, 320, 1],
  ["drawable-land-hdpi/splash.png", 800, 480, 1.5],
  ["drawable-land-xhdpi/splash.png", 1280, 720, 2],
  ["drawable-land-xxhdpi/splash.png", 1600, 960, 3],
  ["drawable-land-xxxhdpi/splash.png", 1920, 1280, 4],
  ["drawable-port-mdpi/splash.png", 320, 480, 1],
  ["drawable-port-hdpi/splash.png", 480, 800, 1.5],
  ["drawable-port-xhdpi/splash.png", 720, 1280, 2],
  ["drawable-port-xxhdpi/splash.png", 960, 1600, 3],
  ["drawable-port-xxxhdpi/splash.png", 1280, 1920, 4],
];
const markGroup = mark.match(/<g[^>]*>[\s\S]*?<\/g>/)?.[0];
if (!markGroup) throw new Error("Could not find the master mark artwork.");
for (const [relative, width, height, scale] of splashFiles) {
  const size = Math.round(72 * scale);
  const x = Math.round((width - size) / 2);
  const y = Math.round((height - size) / 2);
  const splash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#FFFCF7"/><svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 100 100">${markGroup}</svg></svg>`;
  await renderSvg(splash, resolve(res, relative), width, height);
}

await browser.close();
console.log(`Generated ${densities.length * 3 + splashFiles.length} Android brand assets from brand/assets masters.`);
