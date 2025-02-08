module.exports = {
    name: 'kick',
    description: 'Kick a user from the server.',
    async execute(message, args, db) {
        if (!message.member.permissions.has('KICK_MEMBERS')) {
            return message.reply("You don't have permission to kick members.");
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to kick.');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('User not found in this server.');
        }

        try {
            await member.kick('Violation of server rules');
            message.channel.send(`${user.tag} has been kicked.`);
            
            db.query('INSERT INTO moderation_logs (user_id, action, reason) VALUES (?, ?, ?)', 
                [user.id, 'kick', 'Violation of server rules']);
        } catch (error) {
            console.error(error);
            message.reply('Failed to kick the user.');
        }
    }
};
