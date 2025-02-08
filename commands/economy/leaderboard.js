const db = require('../../database/db');

module.exports = {
    name: 'leaderboard',
    description: 'Check the top 10 users with the highest balance.',
    async execute(message) {
        try {
            // Fetch the top 10 users by balance
            const [rows] = await db.query('SELECT user_id, balance FROM economy ORDER BY balance DESC LIMIT 10');

            if (rows.length === 0) {
                return message.reply('No users are currently in the economy system.');
            }

            // Format the leaderboard
            let leaderboard = '**🏆 Economy Leaderboard 🏆**\n';
            rows.forEach((user, index) => {
                const member = message.guild.members.cache.get(user.user_id);
                const username = member ? member.user.username : `Unknown User (${user.user_id})`;
                leaderboard += `\`${index + 1}.\` **${username}** - 💰 ${user.balance} coins\n`;
            });

            message.channel.send(leaderboard);
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching the leaderboard.');
        }
    }
};
