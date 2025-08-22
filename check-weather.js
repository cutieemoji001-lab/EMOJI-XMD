const axios = require('axios');
const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "weather",
    desc: "🌤 Get weather information for a location",
    react: "🌤",
    category: "other",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) return reply("❗ Please provide a city name. Usage: .weather [city name]");

        // ✅ Create fake verified contact
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:PK-XMD Official ✅
TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}
END:VCARD`;

        const fakeContact = await conn.sendMessage(from, {
            contacts: {
                displayName: "PK-XMD Official ✅",
                contacts: [{ vcard }]
            }
        });

        const apiKey = '2d61a72574c11c4f36173b627f8cb177'; 
        const city = q;
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;

        const weather = `
> 🌍 *Weather for ${data.name}, ${data.sys.country}*  
> 🌡️ *Temp:* ${data.main.temp}°C  
> 🧊 *Feels Like:* ${data.main.feels_like}°C  
> 🔻 *Min:* ${data.main.temp_min}°C  
> 🔺 *Max:* ${data.main.temp_max}°C  
> 💧 *Humidity:* ${data.main.humidity}%  
> ☁️ *Weather:* ${data.weather[0].main}  
> 🌫️ *Description:* ${data.weather[0].description}  
> 💨 *Wind:* ${data.wind.speed} m/s  
> 📊 *Pressure:* ${data.main.pressure} hPa  

> ⚙️ *Powered by Pkdriller*
`;

        await conn.sendMessage(from, {
            text: weather,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363288304618280@newsletter',
                    newsletterName: "ᴘᴋ-ɴᴇᴛᴡᴏʀᴋ 🔥",
                    serverMessageId: 100
                }
            }
        }, { quoted: fakeContact });

    } catch (e) {
        console.log(e);
        if (e.response && e.response.status === 404) {
            return reply("🚫 City not found. Please check the spelling and try again.");
        }
        return reply("⚠️ An error occurred while fetching the weather information. Please try again later.");
    }
});
                        
