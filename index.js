// Import necessary modules
const { Client, Intents, Collection } = require('discord.js');
const mysql = require('mysql2');
const fs = require('fs');
require('dotenv').config();

// Create bot client
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

// MySQL Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// Load commands dynamically
client.commands = new Collection();
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

// Event handler
client.on('messageCreate', async message => {
    if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;
    const args = message.content.slice(process.env.PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;
    
    try {
        client.commands.get(commandName).execute(message, args, db);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command!');
    }
});

// Login bot
client.login(process.env.TOKEN);
