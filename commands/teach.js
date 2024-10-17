const axios = require('axios');

module.exports = {
  name: 'teach',
  description: 'Teach Sim a new response',
  author: 'Carl John Villavito',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    if (args.length < 2) {
      sendMessage(senderId, { text: 'Usage: /teach <question> <answer>' }, pageAccessToken);
      return;
    }

    const question = args[0];
    const answer = args.slice(1).join(' '); // Join the remaining args as the answer

    const apiUrl = `https://sim.up.railway.app/teach?question=${encodeURIComponent(question)}&answer=${encodeURIComponent(answer)}`;

    try {
      const response = await axios.get(apiUrl);
      const message = response.data.message;

      sendMessage(senderId, { text: message }, pageAccessToken);
    } catch (error) {
      console.error('Error teaching Sim:', error);
      sendMessage(senderId, { text: 'There was an error trying to teach Sim. Please try again later.' }, pageAccessToken);
    }
  }
};