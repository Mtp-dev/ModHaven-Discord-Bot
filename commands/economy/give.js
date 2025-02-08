const db = require('../../database/db');

module.exports = {
    name: 'give',
    description: 'Give coins to another user.',
    async execute(message, args) {
        const senderId = message.author.id;
        const recipient = message.mentions.users.first();
        const amount = parseInt(args[1], 10);

        if (!recipient) {
            return message.reply('You need to mention a user to give coins to.');
        }

        if (isNaN(amount) || amount <= 0) {
            return message.reply('Please enter a valid amount.');
        }

        const recipientId = recipient.id;

        if (senderId === recipientId) {
            return message.reply('You cannot send coins to yourself.');
        }

        try {
            // Check sender's balance
            const [senderRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [senderId]);

            if (senderRows.length === 0 || senderRows[0].balance < amount) {
                return message.reply('You do not have enough coins to send.');
            }

            // Deduct from sender
            await db.query('UPDATE economy SET balance = balance - ? WHERE user_id = ?', [amount, senderId]);

            // Check if recipient exists
            const [recipientRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [recipientId]);

            if (recipientRows.length === 0) {
                await db.query('INSERT INTO economy (user_id, balance) VALUES (?, ?)', [recipientId, amount]);
            } else {
                await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [amount, recipientId]);
            }

            message.reply(`You have successfully sent **${amount} coins** to ${recipient.username}!`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing the transaction.');
        }
    }
};
