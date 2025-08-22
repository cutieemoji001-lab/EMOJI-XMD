const { cmd } = require('../command');

cmd({
    pattern: "online",
    alias: ["whosonline", "active"],
    desc: "Show recently active members",
    react: "🟢",
    category: "group",
    use: '.online',
    filename: __filename
},
async (conn, mek, m, {
    from, isGroup, reply, participants, groupMetadata
}) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups!");
        
        // Show processing indicator
        await reply("🕒 Checking active members...");
        await conn.sendPresenceUpdate('composing', from);

        // Get current timestamp
        const now = Date.now();
        
        // Get online members (presence-based)
        const activeMembers = [];
        const groupJid = from;

        // Check presence for each participant
        for (const participant of participants) {
            const userJid = participant.id;
            try {
                // Get user's presence
                const presence = conn.presences[groupJid]?.[userJid]?.lastKnownPresence;
                const lastSeen = await conn.fetchStatus(userJid).catch(() => null);
                
                // Determine activity status
                const isActive = ['available', 'composing', 'recording'].includes(presence);
                const recentlyActive = lastSeen?.lastSeen && (now - lastSeen.lastSeen * 1000 < 5 * 60 * 1000); // 5 minutes
                
                if (isActive || recentlyActive) {
                    const phoneNumber = userJid.split('@')[0];
                    const contactName = participant.name || participant.notify || `User${phoneNumber}`;
                    
                    activeMembers.push({
                        jid: userJid,
                        name: contactName,
                        number: phoneNumber,
                        status: isActive ? "Online Now" : `Active ${Math.floor((now - lastSeen.lastSeen * 1000) / 60000)} min ago`
                    });
                }
            } catch (e) {
                // Skip errors
            }
        }

        // Sort active members by status
        activeMembers.sort((a, b) => {
            if (a.status === "Online Now") return -1;
            if (b.status === "Online Now") return 1;
            return a.status.localeCompare(b.status);
        });

        // Create the active members list
        let activeList = `🌟 *ACTIVE MEMBERS (${activeMembers.length})*\n\n`;
        activeMembers.forEach((member, index) => {
            activeList += `*${index + 1}.* ${member.name} ➤ \`${member.number}\`\n   _${member.status}_\n`;
        });

        // Add footer
        activeList += `\n📊 *Group Total:* ${participants.length} members`;
        activeList += `\n⏱️ *Note:* Shows users active in the last 5 minutes`;

        // Fake contact for context
        const fakeContact = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: {
                contactMessage: {
                    displayName: 'ACTIVITY TRACKER ✅',
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:PK-XMD BOT\nORG:PK-XMD;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`,
                    jpegThumbnail: null
                }
            }
        };

        // Send the active list
        await conn.sendMessage(from, {
            text: activeList,
            contextInfo: {
                externalAdReply: {
                    title: "GROUP ACTIVITY",
                    body: `Detected ${activeMembers.length} active members`,
                    thumbnailUrl: "https://files.catbox.moe/fgiecg.jpg",
                    sourceUrl: "https://github.com/pkdriller",
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    showAdAttribution: true
                },
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363288304618280@newsletter",
                    newsletterName: "PK-XMD Bot Updates",
                    serverMessageId: Math.floor(Math.random() * 1000000).toString(),
                }
            }
        }, { quoted: fakeContact });

    } catch (e) {
        console.error("Active Command Error:", e);
        reply("❌ Failed to check activity: " + e.message);
    }
});
