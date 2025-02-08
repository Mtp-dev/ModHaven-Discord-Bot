module.exports = {
    name: 'unmute',
    description: 'Unmute a user.',
    async execute(message, args, db) {
        if (!message.member.permissions.has('MUTE_MEMBERS')) {
            return message.reply("You don't have permission to unmute members.");
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to unmute.');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('User not found in this server.');
        }

        const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole) {
            return message.reply('Muted role not found. Please create one.');
        }

        try {
            await member.roles.remove(muteRole);
            db.query('INSERT INTO moderation_logs (user_id, action) VALUES (?, ?)', [user.id, 'unmute']);
            message.channel.send(`${user.tag} has been unmuted.`);
        } catch (error) {
            console.error(error);
            message.reply('Failed to unmute the user.');
        }
    }
};
