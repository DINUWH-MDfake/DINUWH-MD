const axios = require('axios'); const { cmd } = require('../command'); const { fetchJson } = require('../lib/functions');

cmd({ pattern: "hirucheck", alias: ["hirunews", "newshiru", "hnews"], react: "⭐", category: "search hiru news", desc: "Fetch the latest news from the SUHAS API in Hiru API.", use: "", filename: __filename, }, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => { try { const apiUrl = https://suhas-bro-apii.vercel.app/hiru; const response = await axios.get(apiUrl); const data = response.data;

if (!data || !Array.isArray(data) || data.length === 0) {
            return reply(`*No News Available At This Moment* ❗`);
        }

        let newsInfo = "📢 *DINUWH-MD HIRU NEWS LIST 📰*\n\n";
        const latestNews = data.slice(0, 10); // Get the latest 10 news

        latestNews.forEach((news, index) => {
            newsInfo += `🔹 *${index + 1}. Title*: ${news.title}\n`;
            newsInfo += `📖 *Description*: ${news.text}\n`;
            newsInfo += `🔗 *URL*: ${news.newsURL}\n\n`;
        });

        newsInfo += `> *©ᴘᴏᴡᴇʀᴅ ʙʏ ᴅɪɴᴜᴡʜ-ᴍᴅ*`;

        await conn.sendMessage(m.chat, { text: newsInfo }, { quoted: m });
    } catch (error) {
        console.error(error);
        reply(`*TIME එකත් එක්ක පොඩි අව්ල්ක් ඒක හින්දයි htte err එකක් එන්නෙ😼*`);
    }
}

);

