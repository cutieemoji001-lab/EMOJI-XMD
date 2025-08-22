const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const { setCommitHash, getCommitHash } = require('../data/updateDB');

cmd({
  pattern: "update",
  alias: ["upgrade", "sync"],
  react: '🧠',
  desc: "Update PK-XMD bot from GitHub.",
  category: "system",
  filename: __filename
}, async (conn, m, text, { reply, isOwner }) => {
  if (!isOwner) return reply("❌ Only owner can use this command!");

  try {
    await reply("🔎 Checking for PK-XMD updates...");

    const repo = "officialPkdriller/PK-XMD";

    const latestCommit = await axios.get(`https://api.github.com/repos/${repo}/commits/main`);
    const latestHash = latestCommit.data.sha;
    const currentHash = await getCommitHash();

    if (latestHash === currentHash) {
      return reply("✅ You are already using the latest version of PK-XMD!");
    }

    await reply("📥 Downloading latest version...");
    const zipUrl = `https://github.com/${repo}/archive/refs/heads/main.zip`;
    const zipPath = path.join(__dirname, "latest.zip");

    const zipData = await axios.get(zipUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(zipPath, zipData.data);

    const extractPath = path.join(__dirname, "latest");
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    await reply("🧩 Extracted. Replacing old files...");

    const sourcePath = path.join(extractPath, "PK-XMD-main");
    const destinationPath = path.join(__dirname, "..");

    copyFolderSync(sourcePath, destinationPath);

    await setCommitHash(latestHash);

    fs.unlinkSync(zipPath);
    fs.rmSync(extractPath, { recursive: true, force: true });

    await reply("✅ Update completed successfully! Restarting...");
    process.exit(0);

  } catch (err) {
    console.error("Update error:", err);
    return reply("❌ Update failed. Try again later or check logs.");
  }
});

function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

  const items = fs.readdirSync(source);
  for (const item of items) {
    const src = path.join(source, item);
    const dest = path.join(target, item);

    if (["config.js", "app.json", ".env"].includes(item)) continue;

    if (fs.lstatSync(src).isDirectory()) {
      copyFolderSync(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
      }
      
