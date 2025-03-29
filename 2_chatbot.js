import { GoogleGenAI } from "@google/genai";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    history: [
      {
        role: "model",
        parts: [
          { text: "Hello! I'm your AI assistant. How can I help you today?" },
        ],
      },
      {
        role: "user",
        parts: [{ text: "I have 3 dogs at home." }],
      },
    ],
  });

  // Create a readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("AI Chat started! Type 'exit' to quit.");

  function askQuestion() {
    rl.question("You: ", async (userInput) => {
      if (userInput.toLowerCase() === "exit") {
        console.log("Goodbye!");
        rl.close();
        return;
      }

      // Send user input to AI
      const response = await chat.sendMessage({ message: userInput });
      console.log("AI:", response.text);

      // Loop again
      askQuestion();
    });
  }

  askQuestion();
}

await main();
