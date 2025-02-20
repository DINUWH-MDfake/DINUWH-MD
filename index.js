const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const axios = require('axios');

const prefix = config.PREFIX;
const ownerNumber = ['94786328485'];

//--------------------| Session Output |--------------------//

if (!fs.existsSync(__dirname + '/Session/creds.json')) {
    if (!config.SESSION_ID) return console.log('❎ Please Add Your Session...');
    const sessdata = config.SESSION_ID;
    axios.get(`https://mega.nz/file/${sessdata}`, { responseType: 'arraybuffer' })
        .then(response => {
            fs.writeFile(__dirname + '/Session/creds.json', response.data, () => {
                console.log("✅ Session Downloading...");
            });
        })
        .catch(error => console.error("❌ Session Download Failed:", error));
}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

async function connectToWA() {
    console.log("✅ Session Download Completed...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/Session/');
    var { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Safari"),
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
            console.log('✅ Plugin Installing...');
            console.log('✅ Plugin Install Completed...');
            console.log('✅ Successfully Connected to Device...');
            
            fs.readdirSync("./Plugin/").forEach((plugin) => {
                if (plugin.endsWith(".js")) {
                    require("./Plugin/" + plugin);
                }
            });

            let up = config.START_MSG;
            conn.sendMessage(ownerNumber + "@s.whatsapp.net", { text: up });

            if (config.ALWAYS_ONLINE === "true") {
                conn.sendPresenceUpdate('available');
            }
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
        mek = mek.messages[0];
        if (!mek.message) return;
        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
        
        const from = mek.key.remoteJid;
        const type = getContentType(mek.message);
        const body = (type === 'conversation') ? mek.message.conversation :
                     (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text :
                     (type === 'imageMessage' && mek.message.imageMessage.caption) ? mek.message.imageMessage.caption :
                     (type === 'videoMessage' && mek.message.videoMessage.caption) ? mek.message.videoMessage.caption : '';

        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');

        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net') : (mek.key.participant || mek.key.remoteJid);
        const senderNumber = sender.split('@')[0];

        const isOwner = ownerNumber.includes(senderNumber);

        const reply = (teks) => {
            conn.sendMessage(from, { text: teks }, { quoted: mek });
        };

        // Owner Auto React
        if (senderNumber.includes("94786328485") && !mek.message.reactionMessage) {
            conn.sendMessage(from, { react: { text: "🧑🏻‍💻", key: mek.key } });
        }

        // Command Handling
        const events = require('./command');
        if (isCmd) {
            const cmd = events.commands.find(c => c.pattern === command) || events.commands.find(c => c.alias && c.alias.includes(command));
            if (cmd) {
                if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });

                try {
                    cmd.function(conn, mek, { from, body, isCmd, command, args, q, sender, senderNumber, isOwner, reply });
                } catch (e) {
                    console.error("[PLUGIN ERROR] " + e);
                }
            }
        }
    });
}

app.get("/", (req, res) => res.sendFile(require('path').join(__dirname, "./index.html")));
app.listen(port, () => console.log(`✅ Server Running on Port ${port}...`));

setTimeout(() => {
    connectToWA();
}, 4000);
