const axios = require('axios');

module.exports = {
  name: 'teach',
  description: 'Teach Sim a new response using the format: /teach <question> & <answer>',
  author: 'Carl John Villavito',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    // Join the args into a single string to parse the question and answer
    const input = args.join(' ');

    // Check if the input contains the '&' symbol
    if (!input.includes('&')) {
      sendMessage(senderId, { text: 'Usage: /teach <question> & <answer>' }, pageAccessToken);
      return;
    }

    // Split the input into question and answer based on '&'
    const [question, ...answerParts] = input.split('&');
    const answer = answerParts.join('&').trim(); // Join back any parts for the answer

    // Trim whitespace from the question and answer
    const trimmedQuestion = question.trim();
    const trimmedAnswer = answer.trim();

    // Make sure both question and answer are provided
    if (!trimmedQuestion || !trimmedAnswer) {
      sendMessage(senderId, { text: 'Both question and answer must be provided.' }, pageAccessToken);
      return;
    }

    const apiUrl = `https://sim.up.railway.app/teach?question=${encodeURIComponent(trimmedQuestion)}&answer=${encodeURIComponent(trimmedAnswer)}`;

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