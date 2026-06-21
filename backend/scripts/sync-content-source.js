const fs = require("node:fs");
const path = require("node:path");

const backendRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(backendRoot, "..");
const sourceRoot = path.join(repoRoot, "main");
const targetRoot = path.join(backendRoot, "content", "main");
const includedExtensions = new Set([".html", ".js"]);

function copyIncludedFiles(sourceDir) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    if (entry.isDirectory()) {
      copyIncludedFiles(sourcePath);
      continue;
    }

    if (!includedExtensions.has(path.extname(entry.name).toLowerCase())) continue;

    const relativePath = path.relative(sourceRoot, sourcePath);
    const targetPath = path.join(targetRoot, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
  }
}

if (!fs.existsSync(sourceRoot)) {
  console.error(`Frontend source folder was not found: ${sourceRoot}`);
  process.exit(1);
}

fs.rmSync(targetRoot, { recursive: true, force: true });
copyIncludedFiles(sourceRoot);
console.log(`Synced frontend content source to ${targetRoot}`);
