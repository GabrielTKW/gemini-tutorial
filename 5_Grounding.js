import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      "list me all the websites that have malaysia news , and list all the URL",
    ],
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  // Log the raw text response (helpful for debugging)
  console.log("Raw Text Response:", response.text);

  if (
    response &&
    response.candidates &&
    response.candidates.length > 0 &&
    response.candidates[0].groundingMetadata &&
    response.candidates[0].groundingMetadata.groundingSupports
  ) {
    const groundingSupports =
      response.candidates[0].groundingMetadata.groundingSupports;

    const websites = [];

    for (const support of groundingSupports) {
      if (
        support.segment &&
        support.segment.startIndex !== undefined &&
        support.segment.endIndex !== undefined
      ) {
        //This might be related to the text
        const startIndex = support.segment.startIndex;
        const endIndex = support.segment.endIndex;

        const text = response.text.substring(startIndex, endIndex);
        // Regex to find URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = text.match(urlRegex);

        if (urls) {
          websites.push(...urls);
        }
      }
    }

    console.log("Extracted Websites:", JSON.stringify(websites, null, 2));
  } else {
    console.warn("No grounding metadata found in the response.");
    console.log("Full Response:", JSON.stringify(response, null, 2));
  }
}

await main();
