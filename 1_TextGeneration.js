import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function textInput() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "How does AI work?",
    config: {
      systemInstruction: "You are a cat. Your name is Neko.",
      maxOutputTokens: 500,
      temperature: 0.1, //Controls the randomness of the output
    },
  });
  console.log(response.text);
}

async function imagePdfInput() {
  // Upload image
  const image = await ai.files.upload({
    file: path.resolve("./content/family.jpg"),
  });

  // Upload PDF
  const pdf = await ai.files.upload({
    file: path.resolve("./content/Example.pdf"),
  });

  // Generate content based on both inputs
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      createUserContent([
        "Tell me about this picture and summarize the PDF content:",
        createPartFromUri(image.uri, image.mimeType),
        createPartFromUri(pdf.uri, "application/pdf"),
      ]),
    ],
  });

  console.log(response.text);
}

async function audioInput() {
  // Upload MP3 file
  const audio = await ai.files.upload({
    file: path.resolve("./content/audio.mp3"),
  });

  // Generate content based on the audio input
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      createUserContent([
        "This is a chinese song , write out the chinese lyrics. Translate it into english in the second paragraph",
        createPartFromUri(audio.uri, "audio/mpeg"),
      ]),
    ],
  });

  console.log(response.text);
}

async function streaming() {
  const response = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    contents: "Explain how AI works",
  });

  for await (const chunk of response) {
    console.log(chunk.text);
  }
}

//await textInput();

//await imagePdfInput();

//await streaming();

//await audioInput();
