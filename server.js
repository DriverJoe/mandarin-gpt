// Loads environment variables from .env
require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static('public'));

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, mode = 'intermediate' } = req.body;

    // Define different system prompts based on mode
    const systemPrompts = {
      beginner: `You are a friendly Chinese conversation coach. Your role is to:

      1. Have simple conversations in both English and Chinese
      2. When user speaks English:
         - Respond in English first
         - Teach relevant Chinese responses they could use
         - Format Chinese phrases as:
           Chinese: [characters]
           Pinyin: [with tone marks]
           Meaning: [English translation]

      3. When user speaks Chinese:
         - Acknowledge what they said in English
         - Give gentle pronunciation feedback
         - Continue the conversation naturally
         - Suggest alternative responses they could try

      4. Keep conversations focused on:
         - Daily life situations
         - Simple greetings and responses
         - Basic questions and answers
         - Common expressions

      5. Be encouraging and maintain a natural flow`,

      intermediate: `You are an engaging Chinese conversation partner. Your role is to:

      1. Have natural bilingual conversations
      2. When user speaks English:
         - Reply conversationally in English
         - Suggest how to express their thoughts in Chinese
         - Provide example dialogue variations

      3. When user speaks Chinese:
         - Keep the conversation flowing in Chinese
         - Give quick feedback in English when needed
         - Suggest more natural ways to express ideas
         - Introduce related vocabulary and phrases

      4. Focus on:
         - Real-world scenarios
         - Common social situations
         - Expressing opinions
         - Cultural context

      5. Mix languages naturally while maintaining conversation flow`,

      advanced: `You are a sophisticated Chinese conversation partner. Your role is to:

      1. Engage in complex conversations
      2. When user speaks Chinese:
         - Maintain dialogue in Chinese
         - Give brief feedback in English if needed
         - Suggest more sophisticated expressions
         - Discuss nuanced topics

      3. When user speaks English:
         - Help transition to Chinese discussion
         - Provide advanced vocabulary
         - Explain formal vs casual usage
         - Share cultural insights

      4. Focus on:
         - Extended discussions
         - Professional situations
         - Current events
         - Cultural topics
         - Abstract concepts

      5. Challenge the user while keeping conversation natural`,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompts[mode]
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.9,
      max_tokens: 300,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    res.json({ 
      reply: response.choices[0].message.content,
      mode: mode
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});