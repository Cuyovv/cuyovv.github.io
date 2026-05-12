import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainDir = path.join(__dirname, "..", "html", "html-main");
const outFile = path.join(mainDir, "games-manifest.json");

const names = fs
  .readdirSync(mainDir)
  .filter((f) => f.endsWith(".html"))
  .sort((a, b) => {
    const na = parseInt(String(a).match(/^(\d+)/)?.[1] || "0", 10);
    const nb = parseInt(String(b).match(/^(\d+)/)?.[1] || "0", 10);
    if (na !== nb) return na - nb;
    return a.localeCompare(b);
  });

fs.writeFileSync(outFile, JSON.stringify(names), "utf8");
console.log("Wrote", names.length, "entries to", outFile);
