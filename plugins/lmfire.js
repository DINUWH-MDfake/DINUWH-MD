
const { cmd } = require('../command'); // Ensure the path is correct
const axios = require('axios'); // Import axios for HTTP requests
const cheerio = require('cheerio'); // Import cheerio for HTML parsing

cmd({
    pattern: "mediafire",
    alias: ["mfdownload"],
    react: "📥",
    desc: "Download files from MediaFire",
    category: "download",
    use: '.mediafire <file_url>',
    filename: __filename
},
async(conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return await reply("Please provide a MediaFire file URL!");

        // Fetch the MediaFire webpage
        const { data } = await axios.get(q);
        const $ = cheerio.load(data);

        // Select the download link
        const downloadLink = $('a#downloadButton').attr('href');

        if (!downloadLink) {
            return await reply("Could not find the download link. Please check the MediaFire URL.");
        }

        // Fetch the file from the download link
        const fileResponse = await axios({
            url: downloadLink,
            method: 'GET',
            responseType: 'arraybuffer',
        });

        const fileBuffer = Buffer.from(fileResponse.data, 'binary');

        // Send the file to the user
        await conn.sendMessage(from, { 
            document: { 
                url: downloadLink,
                file: fileBuffer,
                mimetype: fileResponse.headers['content-type'], // Use the content type from the response headers
            }, 
            caption: "Didula MD V2 💚 - Here is your file from MediaFire!" 
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        reply('An error occurred while downloading the file. Please ensure the URL is valid and try again.');
    }
});
