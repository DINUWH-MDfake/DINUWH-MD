const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage } = require('./lib/msg');
const axios = require('axios');
const { File } = require('megajs');
const prefix = '.';

const ownerNumber = ['94771820962'];

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
    const sessdata = config.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
        if (err) throw err;
        fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
            console.log("DINUWH MD V2 💚 Session downloaded ✅");
        });
    });
}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

//=============================================

async function connectToWA() {
    console.log("DINUWH MD V2 💚 Connecting wa bot 🧬...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
    var { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
    });

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                connectToWA();
            }
        } else if (connection === 'open') {
            console.log('DINUWH MD V2 💚 😼 Installing...');
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin);
                }
            });
            console.log('DINUWH MD V2 💚 Plugins installed successful ✅');
            console.log('DINUWH MD V2 💚 Bot connected to WhatsApp ✅');
            
            let up = `DINUWH MD V2 💚 Wa-BOT connected successful ✅\n\nPREFIX: ${prefix}`;
            conn.sendMessage(ownerNumber + "@s.whatsapp.net", { image: { url: 'https://i.ibb.co/tC37Q7B/20241220-122443.jpg' }, caption: up });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
        mek = mek.messages[0];
        if (!mek.message) return;
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

        // Auto-Download Status with Caption
        if (mek.key && mek.key.remoteJid === 'status@broadcast') {
            if (config.AUTO_READ_STATUS === "true") {
                await conn.readMessages([mek.key]);

                // React with a random emoji    
                const emojis = ['🧩', '🍉', '💜', '🌸', '🪴', '💊', '💫', '🍂', '🌟', '🎋', '😶‍🌫️', '🫀', '🧿', '👀', '🤖', '🚩', '🥰', '🗿', '💜', '💙', '🌝', '🖤', '💚'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

                await conn.sendMessage(mek.key.remoteJid, {    
                    react: {    
                        text: randomEmoji,    
                        key: mek.key,    
                    }    
                }, { statusJidList: [mek.key.participant] });

                // Download media
                let mediaBuffer = await downloadMediaMessage(mek, 'buffer');
                let captionText = mek.message.imageMessage?.caption || mek.message.videoMessage?.caption || "📌 Status Update";

                if (mediaBuffer) {
                    let msgType = mek.message.imageMessage ? 'image' : mek.message.videoMessage ? 'video' : null;

                    if (msgType) {
                        await conn.sendMessage(ownerNumber + "@s.whatsapp.net", {
                            [msgType]: mediaBuffer,
                            caption: captionText
                        });
                    }
                }
            }
        }
    });

    console.log('DINUWH MD V2 💚 Bot is running... 🚀');
}

// Express Web API
app.get("/", (req, res) => {
    res.send("hey, bot started✅");
});

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

// Start Bot
setTimeout(() => {
    connectToWA();
}, 4000);
