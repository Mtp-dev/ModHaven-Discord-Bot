const db = require('../../database/db');

module.exports = {
    name: 'blackjack',
    description: 'Play a game of blackjack and bet your coins!',
    async execute(message, args) {
        const userId = message.author.id;
        const betAmount = parseInt(args[0], 10);

        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply('Please enter a valid amount to bet.');
        }

        try {
            // Check user's balance
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0 || userRows[0].balance < betAmount) {
                return message.reply('You do not have enough coins to bet.');
            }

            // Function to draw a random card (values 1-11)
            const drawCard = () => Math.floor(Math.random() * 11) + 1;

            // Draw cards for player and dealer
            let playerHand = [drawCard(), drawCard()];
            let dealerHand = [drawCard(), drawCard()];

            let playerTotal = playerHand.reduce((a, b) => a + b, 0);
            let dealerTotal = dealerHand.reduce((a, b) => a + b, 0);

            let resultMessage = `🃏 **Blackjack Game** 🃏\n\n` +
                `**Your hand:** ${playerHand.join(', ')} (**Total:** ${playerTotal})\n` +
                `**Dealer's hand:** ${dealerHand[0]}, ❓\n\n`;

            // Determine outcome
            let winnings = 0;
            if (playerTotal === 21) {
                winnings = betAmount * 2.5; // Blackjack pays 2.5x
                resultMessage += `🎉 **Blackjack! You win ${winnings} coins!**`;
            } else if (playerTotal > 21) {
                winnings = -betAmount;
                resultMessage += `💀 **You busted! You lose ${betAmount} coins.**`;
            } else {
                while (dealerTotal < 17) {
                    dealerHand.push(drawCard());
                    dealerTotal = dealerHand.reduce((a, b) => a + b, 0);
                }

                resultMessage += `**Dealer's final hand:** ${dealerHand.join(', ')} (**Total:** ${dealerTotal})\n\n`;

                if (dealerTotal > 21 || playerTotal > dealerTotal) {
                    winnings = betAmount * 2;
                    resultMessage += `🎉 **You win ${winnings} coins!**`;
                } else if (dealerTotal === playerTotal) {
                    winnings = 0;
                    resultMessage += `😐 **It's a tie! You get your bet back.**`;
                } else {
                    winnings = -betAmount;
                    resultMessage += `💀 **You lose ${betAmount} coins.**`;
                }
            }

            // Update user's balance
            await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [winnings, userId]);

            message.reply(resultMessage);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your blackjack game.');
        }
    }
};
