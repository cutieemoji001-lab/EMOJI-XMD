const { cmd } = require('../command');
const fs = require("fs");
const { exec } = require("child_process");

async function audioEffect(conn, mek, m, { from, quoted, reply }, set) {
  try {
    const qmsg = quoted || m.quoted;
    if (!qmsg) return reply("🎧 Please reply to an *audio message*.");

    // check mime
    const mime = qmsg.mimetype || "";
    if (!mime.includes("audio")) {
      return reply("⚠️ That’s not an audio file, please reply to an audio message.");
    }

    const media = await qmsg.download();
    const inputPath = `./input_${Date.now()}.mp3`;
    const outputPath = `./output_${Date.now()}.mp3`;

    fs.writeFileSync(inputPath, media);

    exec(`ffmpeg -y -i "${inputPath}" ${set} "${outputPath}"`, async (err) => {
      fs.unlinkSync(inputPath);
      if (err) {
        console.error(err);
        return reply("⚠️ Error during processing: " + err.message);
      }

      const buff = fs.readFileSync(outputPath);
      await conn.sendMessage(from, { 
        audio: buff, 
        mimetype: "audio/mpeg",
        ptt: true // play as voice note
      }, { quoted: mek });
      
      fs.unlinkSync(outputPath);
    });
  } catch (e) {
    console.error(e);
    reply("❌ Failed: " + e.message);
  }
}

// Deep
cmd({
  pattern: "deep",
  react: "🎶",
  desc: "Apply deep effect on audio",
  category: "audio-edit",
  use: ".deep (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-af atempo=4/4,asetrate=44500*2/3');
});

// Bass
cmd({
  pattern: "bass",
  react: "🎶",
  desc: "Apply bass effect on audio",
  category: "audio-edit",
  use: ".bass (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-af equalizer=f=40:width_type=h:width=50:g=10');
});

// Reverse
cmd({
  pattern: "reverse",
  react: "🎶",
  desc: "Reverse audio",
  category: "audio-edit",
  use: ".reverse (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-af areverse');
});

// Slow
cmd({
  pattern: "slow",
  react: "🎶",
  desc: "Slow audio effect",
  category: "audio-edit",
  use: ".slow (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-af "atempo=0.8,asetrate=44100"');
});

// Smooth (fixed to audio filter)
cmd({
  pattern: "smooth",
  react: "🎶",
  desc: "Smooth audio effect",
  category: "audio-edit",
  use: ".smooth (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-af "lowpass=f=3000,highpass=f=200"');
});

// Tempo
cmd({
  pattern: "tempo",
  react: "🎶",
  desc: "Tempo effect",
  category: "audio-edit",
  use: ".tempo (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-af "atempo=1.25"');
});

// Nightcore
cmd({
  pattern: "nightcore",
  react: "🎶",
  desc: "Nightcore audio effect",
  category: "audio-edit",
  use: ".nightcore (reply audio)"
}, async (conn, mek, m, opts) => {
  await audioEffect(conn, mek, m, opts, '-af "atempo=1.1,asetrate=44100*1.25"');
});
