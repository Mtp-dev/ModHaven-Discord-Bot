const db = require('../database/db');

module.exports = {
    name: 'config',
    description: 'Configure auto moderation settings (Admins only).',
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply("You don't have permission to configure auto moderation.");
        }

        const setting = args[0]?.toLowerCase();
        const value = args.slice(1).join(' ');

        if (!setting || !value) {
            return message.reply('Usage: `!config <setting> <value>`\n\nAvailable settings:\n`badwords add <word>`\n`badwords remove <word>`\n`maxcaps <percentage>`\n`maxrepeats <number>`\n`links <on/off>`');
        }

        try {
            if (setting === 'badwords') {
                const action = args[1]?.toLowerCase();
                const word = args.slice(2).join(' ');

                if (!['add', 'remove'].includes(action) || !word) {
                    return message.reply('Usage: `!config badwords add/remove <word>`');
                }

                if (action === 'add') {
                    await db.query('INSERT INTO automod_settings (type, value) VALUES (?, ?)', ['badword', word]);
                    message.reply(`🚫 **"${word}"** has been added to the bad words list.`);
                } else {
                    await db.query('DELETE FROM automod_settings WHERE type = ? AND value = ?', ['badword', word]);
                    message.reply(`✅ **"${word}"** has been removed from the bad words list.`);
                }
            } else if (setting === 'maxcaps') {
                if (isNaN(value) || value < 0 || value > 100) {
                    return message.reply('Please enter a valid percentage (0-100) for max caps usage.');
                }

                await db.query('UPDATE automod_settings SET value = ? WHERE type = ?', [value, 'maxcaps']);
                message.reply(`🔠 Maximum caps ratio updated to **${value}%**.`);
            } else if (setting === 'maxrepeats') {
                if (isNaN(value) || value < 1) {
                    return message.reply('Please enter a valid number for max repeated characters.');
                }

                await db.query('UPDATE automod_settings SET value = ? WHERE type = ?', [value, 'maxrepeats']);
                message.reply(`🔁 Maximum repeated characters updated to **${value}**.`);
            } else if (setting === 'links') {
                if (!['on', 'off'].includes(value)) {
                    return message.reply('Please enter `on` or `off` for link filtering.');
                }

                await db.query('UPDATE automod_settings SET value = ? WHERE type = ?', [value, 'links']);
                message.reply(`🔗 Link filtering has been **${value.toUpperCase()}**.`);
            } else {
                message.reply('Invalid setting. Use `!config` for available options.');
            }
        } catch (error) {
            console.error(error);
            message.reply('There was an error updating the auto moderation settings.');
        }
    }
};
