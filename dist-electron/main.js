import { ipcMain as s, dialog as P, app as i, BrowserWindow as E } from "electron";
import d from "node:path";
import { fileURLToPath as R } from "node:url";
import { spawn as S } from "child_process";
import { readFileSync as _ } from "node:fs";
const $ = R(import.meta.url), f = d.dirname($);
let o = null;
const y = () => {
  o = new E({
    width: 1e3,
    height: 700,
    backgroundColor: "#050505",
    titleBarStyle: "hidden",
    webPreferences: {
      preload: d.join(f, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), i.setPath("userData", d.join(i.getPath("appData"), "labokit-electron")), process.env.VITE_DEV_SERVER_URL ? o.loadURL(process.env.VITE_DEV_SERVER_URL) : o.loadFile(d.join(f, "../dist/index.html"));
};
s.handle("dialog:openFile", async () => {
  const { filePaths: m } = await P.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["jpg", "png", "jpeg", "webp"] }]
  });
  return m[0];
});
s.handle("process-image", async (m, { filePath: r, operation: e, model: t }) => new Promise((a, c) => {
  const p = r.replace(/\.[^/.]+$/, "") + "_processed.png";
  let g;
  i.isPackaged ? g = d.join(process.resourcesPath, "app.asar.unpacked", "pyfile", "bridge.py") : g = d.join(f, "../pyfile/bridge.py"), console.log(`Running Python: ${g}`);
  const u = [
    g,
    e,
    "--input",
    r,
    "--output",
    p
  ];
  e === "upscale" && t && u.push("--model", t);
  const h = S("python", u);
  let w = "";
  h.stdout.on("data", (l) => {
    const n = l.toString().trim();
    w += n + `
`, console.log(`Python: ${n}`), n && o && !o.isDestroyed() && o.webContents.send("process-progress", {
      stage: n,
      timestamp: Date.now()
    });
  }), h.stderr.on("data", (l) => {
    const n = l.toString();
    console.error(`Error: ${n}`), o && !o.isDestroyed() && o.webContents.send("process-progress", {
      stage: `ERROR: ${n}`,
      timestamp: Date.now()
    });
  }), h.on("close", (l) => {
    l === 0 && w.includes("SUCCESS") ? a(p) : c(`Process failed with code ${l}. Output: ${w}`);
  }), setTimeout(() => {
    h.kill(), c("Process timeout");
  }, 6e5);
}));
s.handle("read-image-base64", async (m, r) => {
  try {
    return _(r).toString("base64");
  } catch (e) {
    throw new Error(`Failed to read image: ${e}`);
  }
});
s.handle("get-image-dimensions", async (m, r) => {
  try {
    const e = _(r);
    let t = 0, a = 0;
    if (e[0] === 137 && e[1] === 80 && e[2] === 78 && e[3] === 71)
      t = e.readUInt32BE(16), a = e.readUInt32BE(20);
    else if (e[0] === 255 && e[1] === 216) {
      const c = (await import("./index-0KC8p6e7.js")).default, p = c(e);
      t = p.width || 0, a = p.height || 0;
    }
    if (t === 0 || a === 0)
      throw new Error("Could not determine image dimensions");
    return { width: t, height: a };
  } catch (e) {
    throw new Error(`Failed to get image dimensions: ${e}`);
  }
});
i.whenReady().then(() => {
  y(), i.on("activate", () => {
    E.getAllWindows().length === 0 && y();
  });
});
s.on("window:minimize", () => {
  o?.minimize();
});
s.on("window:maximize", () => {
  o?.isMaximized() ? o.unmaximize() : o?.maximize();
});
s.on("window:close", () => {
  o?.close();
});
i.on("window-all-closed", () => {
  process.platform !== "darwin" && i.quit();
});
