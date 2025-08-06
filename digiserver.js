const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle chat requests
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-base", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `Answer this: ${userMessage}`
      })
    });

    const data = await response.json();

    let botReply = "Sorry, I didn’t understand that.";

    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      botReply = data[0].generated_text;
    } else if (data.generated_text) {
      botReply = data.generated_text;
    } else if (data.error) {
      console.error("API Error:", data.error);
      botReply = "Hugging Face API error: " + data.error;
    }

    res.json({ bot: botReply });
  } catch (error) {
    console.error("Hugging Face API error:", error);
    res.status(500).json({ bot: "Oops! I couldn’t connect to my brain right now." });
  }
});

app.listen(PORT, () => {
  console.log(`🤖 DigiBuddy Chatbot running at http://localhost:${PORT}`);
});
