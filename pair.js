const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Get pairing code for EMOJI-XMD bot",
    category: "download",
    use: ".pair 254700123456",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, args, q, senderNumber, reply }) => {
    try {
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Please provide a valid phone number without `+`\nExample: `.pair 254700123456`");
        }

        const res = await axios.get(`https://pk-v33i.onrender.com/code?number=${encodeURIComponent(phoneNumber)}`);
        if (!res.data || !res.data.code) {
            return await reply("❌ Failed to retrieve pairing code. Please try again later.");
        }

        const pairingCode = res.data.code;

        const codeMessage = `
╭─〔 *EMOJI-XMD PAIRING SUCCESSFUL* 〕
│
├─ *📱 Number:* ${phoneNumber}
├─ *🔗 Pairing Code:* ${pairingCode}
│
╰─ *🚀 Powered by EMOJI-XMD*
`.trim();

        await conn.sendMessage(from, {
            image: { url: `https://files.` },
            caption: codeMessage,
            footer: 'Tap below to get code again for copying:',
            templateButtons: [
                {
                    index: 1,
                    quickReplyButton: {
                        displayText: "📋 Copy Code",
                        id: `.copy ${pairingCode}`
                    }
                }
            ],
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    newsletterName: 'EMOJI-XMD UPDATES',
                    serverMessageId: 119
                },
                externalAdReply: {
                    title: "EMOJI-XMD BOT",
                    body: "Auto pairing code system",
                    thumbnailUrl: `https://files.catbox.moe/9pxerh.jpg`,
                    sourceUrl: "https://github.com/cutieemoji001/EMOJI-XMD"
                }
            }
        }, {
            quoted: {
                key: {
                    fromMe: false,
                    participant: "0@s.whatsapp.net",
                    remoteJid: "status@broadcast"
                },
                message: {
                    contactMessage: {
                        displayName: EMOJI-XMD VERIFIED",
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:BOT;EMOJI-XMD;;;\nFN:EMOJI-XMD\nitem1.TEL;waid=254700000000:+254 700 000000\nitem1.X-ABLabel:Bot\nEND:VCARD`
                    }
                }
            }
        });

    } catch (error) {
        console.error("❌ Pair command error:", error);
        await reply("❌ Error retrieving pairing code. Try again later.");
    }
});
                    
