const { cmd, commands } = require("../command");
const yts = require("yt-search");
const { ytmp3 } = require("@vreden/youtube_scraper");

cmd(
{
    pattern: "song",
    alias: "ytmp3",
    react: "🎵",
    desc: "Download Song",
    category: "download",
    filename: __filename,
},
async (
    robin,
    mek,
    m,
    {
        from,
        quoted,
        body,
        isCmd,
        command,
        args,
        q,
        isGroup,
        sender,
        senderNumber,
        botNumber2,
        botNumber,
        pushname,
        isMe,
        isOwner,
        groupMetadata,
        groupName,
        participants,
        groupAdmins,
        isBotAdmins,
        isAdmins,
        reply,
    }
) => {
    try {
        if (!q) return reply("නමක් හරි ලින්ක් එකක් හරි දෙන්න 🌚❤️");

        // Search for the video  
        const search = await yts(q);
        if (!search.videos.length) return reply("❌ Video not found!");

        const data = search.videos[0];
        const url = data.url;

        // Song metadata description  
        let desc = `*⛶𝙳𝙸𝙽𝚄𝚆𝙷 𝙼𝙳 𝚂𝙾𝙽𝙶 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁⛶*
✇━━━━━━━━━━━━━━━━━━━━✇
⛛
*╔═══◈ 🎧 Now Playing... ◈═══╗*
*═════════════════════*

*📌 Title:*  ${data.title}
> ✇━━━━━━━━━━━━━━━━━━━
*⏳ Duration:*  ${data.timestamp}
> ✇━━━━━━━━━━━━━━━━━━━
*📅 Uploaded:*  ${data.ago}
> ✇━━━━━━━━━━━━━━━━━━━
*👀 Views:*  ${data.views}
> ✇━━━━━━━━━━━━━━━━━━━
*🔗 Listen Here:*  ${data.url}
> ✇━━━━━━━━━━━━━━━━━━━

╠═════════════════════════╣
*⬇️ Fetching & Downloading...*
╚═════════════════════════╝

> *🚀 𝚖𝚊𝚔𝚎 𝚋𝚢 𝙳𝙸𝙽𝚄𝚆𝙷*
`;

        // Send externalAdReply with views under channel name  
        await robin.sendMessage(
            from,
            {
                text: desc,
                contextInfo: {
                    externalAdReply: {
                        title: "𝙳𝙸𝙽𝚄𝚆 𝙼𝙳 𝚃𝙴𝙲𝙷 𝙲𝙷𝙰𝙽𝙽𝙴𝙻",
                        body: `👀 Views: ${data.views}`,
                        thumbnail: { url: data.thumbnail },
                        sourceUrl: "https://whatsapp.com/channel/0029Vat7xHl7NoZsrUVjN844",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            },
            { quoted: mek }
        );

        // Download the audio using @vreden/youtube_scraper  
        const quality = "128"; // Default quality  
        const songData = await ytmp3(url, quality);

        if (!songData || !songData.download || !songData.download.url) {
            return reply("❌ Failed to download the song!");
        }

        // Validate song duration (limit: 30 minutes)  
        let durationParts = data.timestamp.split(":").map(Number);
        let totalSeconds =
            durationParts.length === 3
                ? durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]
                : durationParts[0] * 60 + durationParts[1];

        if (totalSeconds > 1800) {
            return reply("⏱️ Audio limit is 30 minutes!");
        }

        // **1️⃣ Send as Normal Audio File**  
        await robin.sendMessage(
            from,
            {
                audio: { url: songData.download.url },
                mimetype: "audio/mpeg",
            },
            { quoted: mek }
        );

        // **2️⃣ Send as a Document**  
        await robin.sendMessage(
            from,
            {
                document: { url: songData.download.url },
                mimetype: "audio/mpeg",
                fileName: `${data.title}.mp3`,
                caption: "𝐌𝐚𝐝𝐞 𝐛𝐲 𝐃𝐈𝐍𝐔𝐖𝐇 𝐌𝐃 ❤️",
            },
            { quoted: mek }
        );

        // **3️⃣ Send as a Voice Note (PTT)**
        await robin.sendMessage(
            from,
            {
                audio: { url: songData.download.url },
                mimetype: "audio/mpeg",
                ptt: true, // This makes it a voice note (PTT)
            },
            { quoted: mek }
        );

        return reply("*✅ Download complete! Enjoy your song!*");

    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message}`);
    }
}
);
