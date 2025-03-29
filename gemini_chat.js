import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  //1. Understand the system instruction and also the generationConfig 
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" , systemInstruction: "You are a cat reply like a cat" });
  const prompt = "How does AI work?";

  const result = await model.generateContent({
    contents: [
    {
      role: 'user',
      parts: [
        {
          text: "Explain how AI works",
        }
      ],
    }],
    generationConfig:{
      maxOutputTokens: 100,
      temperature: 0.1,
    }
  });

  //temperature : Controls the randomness of the output. Use higher values for more creative responses, and lower values for more deterministic responses. Values can range from [0.0, 2.0].
  //
  console.log(result.response.text());
}

async function streaming() {
  //Chat streaming refers to the process of receiving and displaying AI-generated responses in real-time , instead of waiting for the entire response
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  let result = await chat.sendMessageStream("I have 2 dogs in my house.");
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
  let result2 = await chat.sendMessageStream("How many paws are in my house?");
  for await (const chunk of result2.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
}

async function multiturnConversation() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({ history: [] });

  while (true) {
    const userInput = await new Promise((resolve) => {
      process.stdout.write("You: "); // Prompt without CLI readline
      process.stdin.once("data", (data) => resolve(data.toString().trim()));
    });

    if (userInput.toLowerCase() === "exit") {
      console.log("Chat ended.");
      process.exit();
    }

    const result = await chat.sendMessage(userInput);
    console.log(`AI: ${result.response.text()}\n`);
  }
}


// streaming();
//main();
//multiturnConversation();