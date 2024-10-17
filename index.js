const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');
const { sendMessage } = require('./handles/sendMessage'); // Assuming sendMessage.js has the sendMessage function

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'pagebot';
const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8').trim();

// Your Facebook user ID to receive the notification
const senderId = '100013036275290'; // Replace with your actual user ID
const nameOfBot = 'CarlJohn Bot'; // You can customize this as needed

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        const userId = event.sender.id;
        console.log(`Received message from user ID: ${userId}`); // Log the user ID for testing

        if (event.message) {
          handleMessage(event, PAGE_ACCESS_TOKEN);
        } else if (event.postback) {
          handlePostback(event, PAGE_ACCESS_TOKEN);
        }
      });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Notify when the bot is online
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Notify the user that the bot is online (make sure you've interacted with the bot first)
  const notificationMessage = `[SYSTEM] - ${nameOfBot} is now online!`;
  sendMessage(senderId, { text: notificationMessage }, PAGE_ACCESS_TOKEN);
});