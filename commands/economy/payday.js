const db = require('../../database/db');

module.exports = {
    name: 'payday',
    description: 'Claim your scheduled paycheck once per day.',
    async execute(message) {
        const userId = message.author.id;
        const paydayAmount = 1000; // Fixed amount users receive on payday
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        try {
            // Check if user exists in economy table
            const [userRows] = await db.query('SELECT balance, last_payday FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0) {
                // Insert new user into economy table with payday reward
                await db.query('INSERT INTO economy (user_id, balance, last_payday) VALUES (?, ?, ?)', [userId, paydayAmount, Date.now()]);
                return message.reply(`💰 You claimed your first **payday** of **${paydayAmount} coins**!`);
            }

            const lastPayday = userRows[0].last_payday;
            const timeSinceLastPayday = Date.now() - lastPayday;

            if (timeSinceLastPayday < cooldown) {
                const timeLeft = Math.ceil((cooldown - timeSinceLastPayday) / (60 * 60 * 1000)); // Convert to hours
                return message.reply(`🕒 You have already claimed your payday. Please wait **${timeLeft} hours** before claiming again.`);
            }

            // Update user's balance and last payday timestamp
            await db.query('UPDATE economy SET balance = balance + ?, last_payday = ? WHERE user_id = ?', [paydayAmount, Date.now(), userId]);

            message.reply(`💰 You successfully claimed your payday of **${paydayAmount} coins**!`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your payday claim.');
        }
    }
};
