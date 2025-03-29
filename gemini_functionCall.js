import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function setLightValues(brightness, colorTemp) {
    return {
      brightness: brightness,
      colorTemperature: colorTemp
    };
  }

  const controlLightFunctionDeclaration = {
    name: "controlLight",
    parameters: {
      type: "OBJECT",
      description: "Set the brightness and color temperature of a room light.",
      properties: {
        brightness: {
          type: "NUMBER",
          description: "Light level from 0 to 100. Zero is off and 100 is full brightness.",
        },
        colorTemperature: {
          type: "STRING",
          description: "Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.",
        },
      },
      required: ["brightness", "colorTemperature"],
    },
  };

// Put functions in a "map" keyed by the function name so it is easier to call
const functions = {
    controlLight: ({ brightness, colorTemperature }) => {
      return setLightValues( brightness, colorTemperature)
    }
  };


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generativeModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    // Specify the function declaration.
    tools: {
    functionDeclarations: [controlLightFunctionDeclaration],
    },
});


const chat = generativeModel.startChat();
const prompt = "Dim the lights so the room feels cozy and warm.";

const result = await chat.sendMessage(prompt);
const call = result.response.functionCalls()[0];
console.log(call);
if (call) {
  // Call the executable function
  const apiResponse = await functions[call.name](call.args);
    console.log(apiResponse);
  // Send the API response back to the model
  const result2 = await chat.sendMessage([{functionResponse: {
    name: 'controlLight',
    response: apiResponse
  }}]);

  // Log the text response.
  console.log(result2.response.text());
}