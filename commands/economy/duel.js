const db = require('../../database/db');

module.exports = {
    name: 'duel',
    description: 'Challenge another player to a duel for coins!',
    async execute(message, args) {
        const challengerId = message.author.id;
        const opponent = message.mentions.users.first();
        const betAmount = parseInt(args[1], 10);

        if (!opponent) {
            return message.reply('You need to mention a user to duel.');
        }

        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply('Please enter a valid bet amount.');
        }

        const opponentId = opponent.id;

        if (challengerId === opponentId) {
            return message.reply('You cannot duel yourself.');
        }

        try {
            // Check challenger and opponent balance
            const [challengerRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [challengerId]);
            const [opponentRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [opponentId]);

            if (challengerRows.length === 0 || challengerRows[0].balance < betAmount) {
                return message.reply('You do not have enough coins to place this bet.');
            }

            if (opponentRows.length === 0 || opponentRows[0].balance < betAmount) {
                return message.reply(`**${opponent.username}** does not have enough coins to accept the duel.`);
            }

            // Duel outcome (50% chance to win)
            const winner = Math.random() < 0.5 ? challengerId : opponentId;
            const loser = winner === challengerId ? opponentId : challengerId;
            const winnerUser = winner === challengerId ? message.author.username : opponent.username;

            // Update balances
            await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [betAmount, winner]);
            await db.query('UPDATE economy SET balance = balance - ? WHERE user_id = ?', [betAmount, loser]);

            message.reply(`⚔️ **Duel Result:** ${winnerUser} won the duel and earned **${betAmount} coins**!`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing the duel.');
        }
    }
};
