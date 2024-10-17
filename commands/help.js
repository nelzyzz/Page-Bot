const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Show available commands with enhanced formatting',
  author: 'System',
  execute(senderId, args, pageAccessToken, sendMessage) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    // Customize the appearance of the help message
    const commands = commandFiles.map(file => {
      const command = require(path.join(commandsDir, file));
      return `🔹 *${command.name.toUpperCase()}*\n   - _${command.description}_\n   👤 *Author:* ${command.author}`;
    });

    const totalCommands = commandFiles.length;
    const header = `✨ Welcome to *CarlJohn Bot*! ✨\nHere are the available commands you can use:\n\n`;
    const footer = `\n📚 _Use "${prefix}help" to rediscover this list anytime!_`;
    const helpMessage = `${header}${commands.join('\n\n')}\n\n⚙️ *Total Commands Available:* ${totalCommands} ${footer}`;
    
    // Send the formatted help message
    sendMessage(senderId, { text: helpMessage }, pageAccessToken);
  }
};