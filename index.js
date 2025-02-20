ඔයාට ඕනේ විදිහට ANTI_DELETE feature එක සම්පූර්ණ bot code එකට integrate කරලා හදාගන්නවා. මේකෙදි:

Deleted messages detect කරලා ඒව group එකට resend කරනවා.

Deleted media (images/videos) detect කරලා ඒව group එකට resend කරනවා.

Message sender info ඇතුළත් කරනවා.


මේ විදිහට පහත code එකක් use කරන්න.


---

Updated WhatsApp Bot Code with ANTI_DELETE Feature

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, jidNormalizedUser, getContentType, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
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
            console.log('DINUWH MD V2 💚 Bot connected to WhatsApp ✅');
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
                     (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption :
                     (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : '';

        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');

        if (isCmd) {
            const events = require('./command');
            const cmd = events.commands.find((cmd) => cmd.pattern === command) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(command));
            if (cmd) {
                cmd.function(conn, mek, {
                    from, body, isCmd, command, args, q
                });
            }
        }
    });

    // =========================== ANTI DELETE FEATURE ================================
    conn.ev.on('messages.delete', async (message) => {
        if (config.ANTI_DELETE === "true" && message.remoteJid.endsWith('@g.us')) {
            try {
                const deletedMessage = await conn.loadMessage(message.remoteJid, message.id);
                if (deletedMessage) {
                    const deletedContent = deletedMessage.message;
                    let notificationText = `🚨 *Deleted Message Detected* 🚨\n\n`;
                    notificationText += `👤 *From:* @${deletedMessage.participant.split('@')[0]}\n`;

                    if (deletedContent) {
                        if (deletedContent.conversation) {
                            notificationText += `📜 *Message:* ${deletedContent.conversation}`;
                        } else if (deletedContent.extendedTextMessage) {
                            notificationText += `📜 *Message:* ${deletedContent.extendedTextMessage.text}`;
                        } else if (deletedContent.imageMessage) {
                            notificationText += `🖼️ *Image Caption:* ${deletedContent.imageMessage.caption || 'No Caption'}`;
                        } else if (deletedContent.videoMessage) {
                            notificationText += `🎥 *Video Caption:* ${deletedContent.videoMessage.caption || 'No Caption'}`;
                        } else {
                            notificationText += `📌 *Message Type:* ${Object.keys(deletedContent)[0]} message`;
                        }
                    } else {
                        notificationText += `📌 *Message:* Unable to retrieve deleted content`;
                    }

                    await conn.sendMessage(message.remoteJid, { text: notificationText, mentions: [deletedMessage.participant] });

                    if (deletedContent && (deletedContent.imageMessage || deletedContent.videoMessage)) {
                        const media = await downloadMediaMessage(deletedMessage, 'buffer');
                        if (deletedContent.imageMessage) {
                            await conn.sendMessage(message.remoteJid, { image: media, caption: '🔁 *Recovered Deleted Image*' });
                        } else if (deletedContent.videoMessage) {
                            await conn.sendMessage(message.remoteJid, { video: media, caption: '🔁 *Recovered Deleted Video*' });
                        }
                    }
                }
            } catch (error) {
                console.error('Error handling deleted message:', error);
            }
        }
    });

}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

app.get("/", (req, res) => res.send("DINUWH MD Bot is running ✅"));
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

setTimeout(() => { connectToWA(); }, 4000);


---

අලුත් Features

✅ Deleted messages detect කරලා ඒව group එකේ resend කරනවා.
✅ Deleted images සහ videos recover කරලා ඒව resend කරනවා.
✅ Message sender info mention කරනවා.
✅ Recovered media එකට caption එකක් add කරනවා.

දැන් Bot එක ANTI DELETE properly handle කරනවා. මුලු system එකත් පරිස්සමට integrate කරලා තියෙනවා.

මට කියන්නකො වෙනම changes ඕනේද?

