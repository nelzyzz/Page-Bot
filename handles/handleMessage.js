const fs = require("fs");
const path = require("path");
const axios = require("axios");
const config = require("../config.json");
const { getTheme } = require("../website/web.js");

module.exports = async function (event) {
    const isAdmin = config.ADMINS.includes(event.sender.id);
    const messageText = event.message?.text || event.postback?.title || "";
    const imageUrl = event.message?.attachments?.[0]?.payload?.url; // If an image is sent

    // Check if the message is an image
    if (imageUrl) {
        // Handle image recognition
        const imageDescription = await recognizeImage(imageUrl, event.sender.id);
        sendMessage(event.sender.id, { text: imageDescription }, event.pageAccessToken);
    } else if (messageText) {
        // Handle text messages with Sim API
        await callSimAPI(event.sender.id, messageText, event.pageAccessToken);
    }

    // Helper function to call Sim API for text responses
    async function callSimAPI(senderId, messageText, pageAccessToken) {
        const apiUrl = `https://rest-api.joshuaapostol.site/simisimi?prompt=${encodeURIComponent(messageText)}`;

        try {
            const response = await axios.get(apiUrl);
            const simResponse = response.data.reply;

            // Send the response from Sim API back to the user
            sendMessage(senderId, { text: simResponse }, pageAccessToken);
        } catch (error) {
            console.error('Error calling Sim API:', error);
            sendMessage(senderId, { text: 'There was an error communicating with Sim. Please try again later.' }, pageAccessToken);
        }
    }

    // Helper function to send messages
    function sendMessage(senderId, message, pageAccessToken) {
        axios.post(`https://graph.facebook.com/v12.0/me/messages?access_token=${pageAccessToken}`, {
            recipient: { id: senderId },
            message: message
        })
        .then(() => {
            console.log("Message sent successfully.");
        })
        .catch((error) => {
            console.error("Error sending message:", error);
        });
    }

    // Function to recognize the image and return a description
    async function recognizeImage(imageUrl, senderId) {
        const apiUrl = `https://joshweb.click/gemini?prompt=describe%20this%20photo&url=${encodeURIComponent(imageUrl)}`;

        try {
            const response = await axios.get(apiUrl);
            const description = response.data.description || "Sorry, I couldn't describe the image.";

            return description;
        } catch (error) {
            console.error("Error recognizing image:", error);
            return "Apologies, the AI did not return a response. Please try rephrasing your message or try again later.";
        }
    }
};
