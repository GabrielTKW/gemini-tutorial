import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateImage() {
  // Load the image from the local file system
  const imagePath = path.resolve("./content/dog.jpg");
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString("base64");

  // Prepare the content parts
  const contents = [
    { text: "Can you add a 3 dog next to the image?" },
    {
      inlineData: {
        mimeType: "image/jpeg", // Corrected MimeType to image/jpeg
        data: base64Image,
      },
    },
  ];

  try {
    // Set responseModalities to include "Image" so the model can generate an image
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: contents,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });
    // Check the entire response
    console.log("Full Response:", JSON.stringify(response, null, 2));

    if (response && response.candidates && response.candidates.length > 0) {
      if (response.candidates[0].finishReason === "IMAGE_SAFETY") {
        console.warn(
          "Image generation blocked due to safety filters.  Examine the image content."
        );
      } else if (
        response.candidates[0].content &&
        response.candidates[0].content.parts
      ) {
        for (const part of response.candidates[0].content.parts) {
          // Based on the part type, either show the text or save the image
          if (part.text) {
            console.log(part.text);
          } else if (part.inlineData) {
            const imageData = part.inlineData.data;
            const buffer = Buffer.from(imageData, "base64");

            // Construct the output path correctly:
            const outputPath = path.resolve(
              "./content",
              `${Date.now()}gemini-native-image.png`
            );

            fs.writeFileSync(outputPath, buffer);
            console.log(`Image saved as ${outputPath}`);
          }
        }
      } else {
        console.warn(
          "Unexpected response structure. Check the 'Full Response' log above."
        );
      }
    } else {
      console.warn(
        "No candidates in the response. Check the 'Full Response' log above."
      );
    }
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

generateImage();
