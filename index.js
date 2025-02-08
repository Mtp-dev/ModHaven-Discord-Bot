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
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
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

// Moderation Commands
client.commands.set('ban', {
    name: 'ban',
    description: 'Ban a user from the server.',
    async execute(message, args, db) {
        if (!message.member.permissions.has('BAN_MEMBERS')) return message.reply("You don't have permission to ban members.");
        const user = message.mentions.users.first();
        if (!user) return message.reply('Please mention a user to ban.');
        const member = message.guild.members.cache.get(user.id);
        if (!member) return message.reply('User not found in this server.');

        try {
            await member.ban();
            message.channel.send(`${user.tag} has been banned.`);
            db.query('INSERT INTO moderation_logs (user_id, action) VALUES (?, ?)', [user.id, 'ban']);
        } catch (error) {
            console.error(error);
            message.reply('Failed to ban the user.');
        }
    }
});

client.commands.set('kick', {
    name: 'kick',
    description: 'Kick a user from the server.',
    async execute(message, args, db) {
        if (!message.member.permissions.has('KICK_MEMBERS')) return message.reply("You don't have permission to kick members.");
        const user = message.mentions.users.first();
        if (!user) return message.reply('Please mention a user to kick.');
        const member = message.guild.members.cache.get(user.id);
        if (!member) return message.reply('User not found in this server.');

        try {
            await member.kick();
            message.channel.send(`${user.tag} has been kicked.`);
            db.query('INSERT INTO moderation_logs (user_id, action) VALUES (?, ?)', [user.id, 'kick']);
        } catch (error) {
            console.error(error);
            message.reply('Failed to kick the user.');
        }
    }
});

// Login bot
client.login(process.env.TOKEN);
