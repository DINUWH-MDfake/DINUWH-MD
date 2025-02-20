const { cmd } = require('../command');

let contacts = []; // JSON file එකක් හදාගන්න ඕනි නැතුව memory එකේ store කරන්න

cmd({
    pattern: "savecontact",
    alias: ["savecont", "addcontact"],
    react: "📞",
    desc: "Save user's contact with a unique number",
    category: "utility",
    use: ".savecontact <reply to user>",
    filename: __filename
}, 
async(conn, mek, m, { from, reply }) => {
    try {
        if (!m.quoted) return reply("📌 *Usage:* Reply to a user message with .savecontact");
        let contactNumber = m.quoted.sender.split("@")[0];

        // Check if already saved
        if (contacts.some(contact => contact.number === contactNumber)) {
            return reply("⚠ *This contact is already saved!*");
        }

        // Next number එක ගන්න
        let nextNumber = (contacts.length + 1).toString().padStart(3, '0'); // 001, 002, 003 format

        // New Contact Object
        let newContact = {
            name: `DINUWH-MD ${nextNumber}`,
            number: contactNumber
        };

        // Contact list එක memory එකේ save කරන්න
        contacts.push(newContact);

        // Bot එකෙන් Contact Send කරන්න
        await conn.sendMessage(from, {
            contacts: {
                displayName: newContact.name,
                contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${newContact.name}\nTEL:${contactNumber}\nEND:VCARD` }]
            }
        }, { quoted: mek });

        reply(`✅ *Saved Contact:* ${newContact.name} (${contactNumber})`);

    } catch (error) {
        console.error(error);
        reply("⚠ *Error:* Contact save කිරීමට නොහැකි වුණා!");
    }
});
