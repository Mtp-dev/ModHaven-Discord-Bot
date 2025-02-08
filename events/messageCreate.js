const fs = require('fs');
const path = require('path');

module.exports = (client, message) => {
    if (message.author.bot || !message.content.startsWith(process.env.PREFIX)) return;

    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check if the command exists
    const commandFolders = fs.readdirSync(path.join(__dirname, '../commands'));
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(path.join(__dirname, `../commands/${folder}`)).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`../commands/${folder}/${file}`);
            if (command.name === commandName) {
                try {
                    command.execute(message, args);
                } catch (error) {
                    console.error(error);
                    message.reply('There was an error executing this command.');
                }
                return;
            }
        }
    }

    message.reply("That command doesn't exist!");
};
