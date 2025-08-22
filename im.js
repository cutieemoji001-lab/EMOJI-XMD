const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "img",
    alias: ["image", "googleimage", "searchimg"],
    react: "🦋",
    desc: "Search and download Google images",
    category: "fun",
    use: ".img <keywords>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return reply("🖼️ Please provide a search query\nExample: .img cute cats");
        }

        await reply(`🔍 Searching images for "${query}"...`);

        const url = `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(query)}`;
        const response = await axios.get(url);

        // Validate response
        if (!response.data?.success || !response.data.results?.length) {
            return reply("❌ No images found. Try different keywords");
        }

        const results = response.data.results;
        // Get 5 random images
        const selectedImages = results
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        // Fake contact for context
        const fakeContact = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: {
                contactMessage: {
                    displayName: 'IMAGE SEARCH ✅',
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:EMOJI-XMD BOT\nORG:EMOJI-XMD;\nTEL;type=CELL;type=VOICE;waid=254700000000:+254 700 000000\nEND:VCARD`,
                    jpegThumbnail: null
                }
            }
        };

        // Send results with enhanced context
        const contextMessage = await conn.sendMessage(
            from,
            { 
                text: `🔍 *Image Search Results for:* ${query}\n\n` +
                      `📸 Found *${results.length}* images\n` +
                      `🖼️ Sending *${selectedImages.length}* random samples\n\n` +
                      `> © Powered by  EMOJI-XMD`,
                contextInfo: {
                    externalAdReply: {
                        title: "GOOGLE IMAGE SEARCH",
                        body: "Powered by EMOJI-XMD API",
                        thumbnailUrl: "https://files.9b8c4ae7-3ffe-4efd-bf30-72b10f25b157.jpeg",
                        sourceUrl: "https://github.com/cutieemoji001",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        showAdAttribution: true
                    },
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363288304618280@newsletter",
                        newsletterName: "EMOJI-XMD Bot Updates",
                        serverMessageId: Math.floor(Math.random() * 1000000).toString(),
                    }
                }
            },
            { quoted: fakeContact }
        );

        // Send images with reference to context message
        for (const imageUrl of selectedImages) {
            await conn.sendMessage(
                from,
                { 
                    image: { url: imageUrl },
                    caption: `📷 ${query}\n> © Powered by EMOJI-XMD`,
                    contextInfo: {
                        stanzaId: contextMessage.key.id,
                        participant: '0@s.whatsapp.net'
                    }
                }
            );
            // Add delay between sends to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
        console.error('Image Search Error:', error);
        reply(`❌ Error: ${error.message || "Failed to fetch images"}`);
    }
});
