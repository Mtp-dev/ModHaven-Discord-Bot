module.exports = {
    name: 'unlock',
    description: 'Unlock a channel to allow users to send messages again.',
    async execute(message, args) {
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply("You don't have permission to unlock channels.");
        }

        const channel = message.mentions.channels.first() || message.channel;
        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SEND_MESSAGES: true });
            message.channel.send(`${channel} has been unlocked.`);
        } catch (error) {
            console.error(error);
            message.reply('Failed to unlock the channel.');
        }
    }
};
