module.exports = {
    name: 'lock',
    description: 'Lock a channel to prevent users from sending messages.',
    async execute(message, args) {
        if (!message.member.permissions.has('MANAGE_CHANNELS')) {
            return message.reply("You don't have permission to lock channels.");
        }

        const channel = message.mentions.channels.first() || message.channel;
        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SEND_MESSAGES: false });
            message.channel.send(`${channel} has been locked.`);
        } catch (error) {
            console.error(error);
            message.reply('Failed to lock the channel.');
        }
    }
};
