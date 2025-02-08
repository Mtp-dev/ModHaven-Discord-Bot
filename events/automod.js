const db = require('../database/db');

module.exports = async (client, message) => {
    if (message.author.bot) return;

    // Define settings (can later be moved to database for customization)
    const badWords = ['badword1', 'badword2', 'badword3']; // Add more words here
    const maxCapsRatio = 0.7; // If over 70% of message is caps, it's spam
    const maxRepeats = 4; // Maximum repeated characters allowed
    const linkRegex = /(https?:\/\/[^\s]+)/g; // Detects links

    // 1️⃣ **Bad Words Detection**
    if (badWords.some(word => message.content.toLowerCase().includes(word))) {
        await message.delete();
        message.channel.send(`🚫 **${message.author.username}**, watch your language!`);
        await db.query('INSERT INTO moderation_logs (user_id, action, reason) VALUES (?, ?, ?)', [message.author.id, 'autowarn', 'Used bad language']);
        return;
    }

    // 2️⃣ **Excessive Caps Detection**
    const capsCount = message.content.replace(/[^A-Z]/g, '').length;
    if (capsCount / message.content.length > maxCapsRatio) {
        await message.delete();
        message.channel.send(`🔇 **${message.author.username}**, please avoid excessive caps.`);
        await db.query('INSERT INTO moderation_logs (user_id, action, reason) VALUES (?, ?, ?)', [message.author.id, 'autowarn', 'Excessive caps usage']);
        return;
    }

    // 3️⃣ **Spam Detection (Repeated Characters)**
    const repeatedCharRegex = /(.)\1{3,}/; // Detects 4 or more repeated characters
    if (repeatedCharRegex.test(message.content)) {
        await message.delete();
        message.channel.send(`🤖 **${message.author.username}**, please avoid spamming.`);
        await db.query('INSERT INTO moderation_logs (user_id, action, reason) VALUES (?, ?, ?)', [message.author.id, 'autowarn', 'Spamming']);
        return;
    }

    // 4️⃣ **Link Detection (If not allowed)**
    if (linkRegex.test(message.content) && !message.member.permissions.has('MANAGE_MESSAGES')) {
        await message.delete();
        message.channel.send(`🔗 **${message.author.username}**, posting links is not allowed.`);
        await db.query('INSERT INTO moderation_logs (user_id, action, reason) VALUES (?, ?, ?)', [message.author.id, 'autowarn', 'Posted a link']);
        return;
    }
};
