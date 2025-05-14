import axios from 'axios';
import { config } from '../config/env.js';

/**
 * Call the Gemini API to get response for a prompt
 * @param {string} prompt - Prompt to send to Gemini API
 * @returns {Promise<string>} - Response from the AI
 */
export const getGeminiResponse = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received from AI.';
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    throw new Error('Failed to get response from AI');
  }
};