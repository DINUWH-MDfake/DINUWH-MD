const axios = require('axios');
const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');


cmd({
    pattern: "hirucheck",
    alias: ["hirunews","newshiru","hnews"],
    react: "⭐",
    category: "search hiru news",
    desc: "Fetch the latest news from the SUHAS API in Hiru API.",
    use: "",
    filename: __filename,
},
    async (conn, mek, m, {
        from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber,
        botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName,
        participants, groupAdmins, isBotAdmins, isAdmins, reply
    }) => {
        try {
            const apiUrl = `https://suhas-bro-apii.vercel.app/hiru`;
//Dont Change This API Key
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data || !data.newsURL || !data.title || !data.image || !data.text) {
                return reply(`*No News Available At This Moment* ❗`);
            }

            const { newsURL, title, image, text, Power } = data;

            let newsInfo = "DINUWH-MD HIRU NEWS LIST 📰\n\n";
            newsInfo += `✨ *Title*: ${title}\n\n`;
            newsInfo += `📑 *Description*:\n${text}\n\n`;
            newsInfo += `♻ *Url*: www.hirunews.lk\n\n`;
            newsInfo += `> *©ᴘᴏᴡᴇʀᴅ ʙʏ ᴅɪɴᴜᴡʜ-ᴍᴅ*\n\n*${Power}*`;

            if (image) {
                await conn.sendMessage(m.chat, {
                    image: { url: image },
                    caption: newsInfo,
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { text: newsInfo }, { quoted: m });
            }

        } catch (error) {
            console.error(error);
            reply(`*TIME එකත් එක්ක පොඩි අව්ල්ක් ඒක හින්දයි htte err එකක් එන්නෙ😼*`);
        }
    }
);
