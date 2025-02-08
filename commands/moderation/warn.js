module.exports = {
    name: 'warn',
    description: 'Warn a user.',
    async execute(message, args, db) {
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply("You don't have permission to warn members.");
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention a user to warn.');
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            db.query('INSERT INTO warnings (user_id, reason, issued_by) VALUES (?, ?, ?)', 
                [user.id, reason, message.author.id]);
            
            message.channel.send(`${user.tag} has been warned for: ${reason}`);
        } catch (error) {
            console.error(error);
            message.reply('Failed to warn the user.');
        }
    }
};
