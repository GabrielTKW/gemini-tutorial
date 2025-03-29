import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//Pre-processing the file 
const base64Buffer = fs.readFileSync( "C:\\Users\\3842351\\Documents\\Work\\gemini-tutorial\\content\\audio.mp3");
const base64AudioFile = base64Buffer.toString("base64");

// Initialize a Gemini model appropriate for your use case.
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

// Generate content using a prompt and the metadata of the uploaded file.
const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "audio/mp3",
        data: base64AudioFile
      }
    },
    { text: "Extract the chinese lyrics in one Paragraph . Then for second paragraph make it english version" },
  ]);

// Print the response.
console.log(result.response.text())