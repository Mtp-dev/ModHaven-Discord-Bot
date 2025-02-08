const db = require('../../database/db');

module.exports = {
    name: 'richest',
    description: 'See who the richest person in the server is!',
    async execute(message) {
        try {
            // Fetch the richest user based on total balance (wallet + bank)
            const [rows] = await db.query('SELECT user_id, balance + bank AS total FROM economy ORDER BY total DESC LIMIT 1');

            if (rows.length === 0) {
                return message.reply('There are no users in the economy system yet.');
            }

            const richestUser = rows[0];
            const member = message.guild.members.cache.get(richestUser.user_id);
            const username = member ? member.user.username : `Unknown User (${richestUser.user_id})`;

            message.reply(`🏆 The richest person in the server is **${username}** with **${richestUser.total} coins**!`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching the richest user.');
        }
    }
};
