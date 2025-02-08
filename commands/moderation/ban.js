module.exports = {
    name: 'ban',
    description: 'Ban a user from the server.',
    async execute(message, args, db) {
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.reply("You don't have permission to ban members.");
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to ban.');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('User not found in this server.');
        }

        try {
            await member.ban({ reason: 'Violation of server rules' });
            message.channel.send(`${user.tag} has been banned.`);
            
            db.query('INSERT INTO moderation_logs (user_id, action, reason) VALUES (?, ?, ?)', 
                [user.id, 'ban', 'Violation of server rules']);
        } catch (error) {
            console.error(error);
            message.reply('Failed to ban the user.');
        }
    }
};
