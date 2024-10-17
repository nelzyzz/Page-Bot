const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

const commands = new Map();
const prefix = '/';

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.name.toLowerCase(), command);
}

async function handleMessage(event, pageAccessToken) {
  const senderId = event.sender.id;
  const messageText = event.message.text.trim().toLowerCase();

  // Check if the user sends "prefix" (case insensitive)
  if (messageText === 'prefix') {
    sendMessage(senderId, { text: `The prefix for commands in this bot is "${prefix}".` }, pageAccessToken);
    return;
  }

  // Check if the message starts with the prefix
  if (!messageText.startsWith(prefix)) {
    const warningMessage = `You cannot access the bot like that. Please use "${prefix}help" to get the list of commands.`;
    sendMessage(senderId, { text: warningMessage }, pageAccessToken);
    return;
  }

  // Proceed with processing the command if it has the correct prefix
  const args = messageText.slice(prefix.length).split(' ');
  const commandName = args.shift().toLowerCase();

  // Check if the user just sent the prefix "/"
  if (commandName === '') {
    sendMessage(senderId, { text: 'Invalid command. Please provide a valid command.' }, pageAccessToken);
    return;
  }

  // Check if the command exists
  if (commands.has(commandName)) {
    const command = commands.get(commandName);
    try {
      await command.execute(senderId, args, pageAccessToken, sendMessage);
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      sendMessage(senderId, { text: 'There was an error executing that command.' }, pageAccessToken);
    }
  } else {
    sendMessage(senderId, { text: `The command "${commandName}" is not available. Please use a valid command.` }, pageAccessToken);
  }
}

module.exports = { handleMessage };