module.exports = {
    name: 'purge',
    description: 'Delete a specified number of messages from a channel.',
    async execute(message, args) {
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply("You don't have permission to delete messages.");
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('Please provide a number between 1 and 100 for the amount of messages to delete.');
        }

        try {
            const deletedMessages = await message.channel.bulkDelete(amount, true);
            message.channel.send(`Deleted ${deletedMessages.size} messages.`).then(msg => setTimeout(() => msg.delete(), 5000));
        } catch (error) {
            console.error(error);
            message.reply('Failed to delete messages. Ensure messages are not older than 14 days.');
        }
    }
};
