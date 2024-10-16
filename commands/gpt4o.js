const axios = require('axios');

module.exports = {
  name: 'gpt4o',
  description: 'Generate text and images using GPT-4o API',
  author: 'Carl John Villavito',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');

    // Inform the user that content is being generated
    sendMessage(senderId, { text: 'Generating content... Please wait.' }, pageAccessToken);

    try {
      const apiUrl = `https://deku-rest-apis.ooguy.com/api/gpt-4o?q=${encodeURIComponent(prompt)}&uid=${senderId}`;
      const response = await axios.get(apiUrl);

      // Extract the result from the response
      const result = response.data.result;

      // Check if the response contains an image link (using a regex pattern)
      const regex = /({[^}]+})\s*!image([^)]+)\s*(.*)/s;
      const match = result.match(regex);

      if (match) {
        // This is a text-image response
        const jsonText = match[1]; // The JSON text with size and prompt
        const imageUrl = match[2]; // The image URL
        const descriptionText = match[3]; // The rest of the text description

        // Send the image first as an attachment
        const imageAttachment = {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl,
              is_reusable: true
            }
          }
        };

        // Send the image to the user
        sendMessage(senderId, imageAttachment, pageAccessToken);

        // Send the prompt description and additional text separately
        sendMessage(senderId, { text: jsonText }, pageAccessToken);
        if (descriptionText.trim()) {
          sendMessage(senderId, { text: descriptionText }, pageAccessToken);
        }

      } else {
        // This is a text-only response
        sendMessage(senderId, { text: result }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error calling GPT-4o API:', error);
      sendMessage(senderId, { text: 'There was an error generating the content. Please try again later.' }, pageAccessToken);
    }
  }
};