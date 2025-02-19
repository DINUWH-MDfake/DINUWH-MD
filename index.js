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
const events = require('./command'); // Commands එක load කරන්න

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

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

  conn.ev.on('messages.upsert', async(mek) => {
    mek = mek.messages[0];
    if (!mek.message) return;
    mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

    const from = mek.key.remoteJid;
    const type = getContentType(mek.message);
    const body = type === 'conversation' ? mek.message.conversation : 
                 type === 'extendedTextMessage' ? mek.message.extendedTextMessage.text : 
                 type === 'imageMessage' ? mek.message.imageMessage.caption : 
                 type === 'videoMessage' ? mek.message.videoMessage.caption : '';
    
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');
    const isGroup = from.endsWith('@g.us');
    const sender = mek.key.fromMe ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : mek.key.participant || mek.key.remoteJid;
    const senderNumber = sender.split('@')[0];
    const botNumber = conn.user.id.split(':')[0];
    const isOwner = ownerNumber.includes(senderNumber) || botNumber.includes(senderNumber);

    const reply = (text) => {
      conn.sendMessage(from, { text }, { quoted: mek });
    };

    // Auto status reader
    if (mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
      await conn.readMessages([mek.key]);

      // Random emoji reaction
      const emojis = ['🧩', '🍉', '💜', '🌸', '🪴', '💊', '💫', '🍂', '🌟', '🎋', '😶‍🌫️', '🫀', '🧿', '👀', '🤖', '🚩', '🥰', '🗿', '💜', '💙', '🌝', '🖤', '💚'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      
      await conn.sendMessage(mek.key.remoteJid, {    
        react: {    
          text: randomEmoji,    
          key: mek.key,    
        }    
      }, { statusJidList: [mek.key.participant] });
    }

    // Auto Status Downloader
    if (mek.key.remoteJid === 'status@broadcast' && (type === 'imageMessage' || type === 'videoMessage')) {
      let media = await downloadMediaMessage(mek, 'buffer');
      if (media) {
        await conn.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
          [type === 'imageMessage' ? 'image' : 'video']: media,
          caption: body
        });
      }
    }

    // Command Handling
    if (isCmd) {
      const cmd = events.commands.find((cmd) => cmd.pattern === command) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(command));

      if (cmd) {
        if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
        try {    
          cmd.function(conn, mek, { from, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber, isOwner, reply });    
        } catch (e) {    
          console.error("[PLUGIN ERROR] " + e);    
        }
      }
    }
  });
}

app.get("/", (req, res) => {
  res.send("hey, bot started✅");
});

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

setTimeout(() => {
  connectToWA();
}, 4000);
