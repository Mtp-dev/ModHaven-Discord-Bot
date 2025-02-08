const db = require('../../database/db');

module.exports = {
    name: 'work',
    description: 'Work a job and earn coins.',
    async execute(message) {
        const userId = message.author.id;

        try {
            // Check if user exists in the economy table
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0) {
                await db.query('INSERT INTO economy (user_id, balance) VALUES (?, ?)', [userId, 1000]);
            }

            // Define random job outcomes
            const jobs = [
                { text: 'as a Developer', amount: Math.floor(Math.random() * 500) + 100 },
                { text: 'as a Cashier', amount: Math.floor(Math.random() * 300) + 50 },
                { text: 'as a Chef', amount: Math.floor(Math.random() * 400) + 80 },
                { text: 'as an Electrician', amount: Math.floor(Math.random() * 600) + 150 },
                { text: 'as a Taxi Driver', amount: Math.floor(Math.random() * 350) + 70 }
            ];

            // Pick a random job
            const job = jobs[Math.floor(Math.random() * jobs.length)];

            // Add earnings to the user's balance
            await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [job.amount, userId]);

            message.reply(`💼 You worked **${job.text}** and earned **${job.amount} coins**!`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your work.');
        }
    }
};
