module.exports = {
    name: 'mute',
    description: 'Mute a user.',
    async execute(message, args, db) {
        if (!message.member.permissions.has('MUTE_MEMBERS')) {
            return message.reply("You don't have permission to mute members.");
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to mute.');
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
            await member.roles.add(muteRole);
            db.query('INSERT INTO moderation_logs (user_id, action) VALUES (?, ?)', [user.id, 'mute']);
            message.channel.send(`${user.tag} has been muted.`);
        } catch (error) {
            console.error(error);
            message.reply('Failed to mute the user.');
        }
    }
};
