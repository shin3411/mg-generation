const express = require('express');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function getPromptFromGPT(birthdate, birthtime, gender) {
  try {
    const genderDescriptor = gender === 'male' ? 'handsome' : 'beautiful';

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides concise and effective prompts for image generation based on given details."
          },
          {
            role: "user",
            content: `Based on the birthdate "${birthdate}" and birthtime "${birthtime}", generate a brief description for a portrait of a ${genderDescriptor} East Asian individual. The description should include:
            
            - Face shape
            - Eyes
            - Nose
            - Mouth
            - Overall expression
            
            The portrait should reflect the characteristics and aesthetics of the individual based on these details.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Create the log entry
    const promptText = response.data.choices[0].message.content.trim();
    const timestamp = new Date().toISOString();
    const logEntry = `Timestamp: ${timestamp}\nGenerated prompt: ${promptText}\n\n`;

    // Append to the log file
    fs.appendFileSync('prompt-log.txt', logEntry);

    // Log the prompt to console
    console.log('Generated prompt:', promptText);

    return promptText;
  } catch (error) {
    console.error('Error generating prompt from GPT-4:', error);
    throw new Error('Failed to generate prompt from GPT-4');
  }
}

async function generateImage(prompt) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image');
  }
}

app.post('/generate-image', async (req, res) => {
  try {
    const { birthdate, birthtime, gender } = req.body;

    // 1. 프롬프트 생성
    const prompt = await getPromptFromGPT(birthdate, birthtime, gender);

    // 2. 이미지 생성
    const imageUrl = await generateImage(prompt);

    res.json({ imageUrl });
  } catch (error) {
    console.error('Error in /generate-image:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
