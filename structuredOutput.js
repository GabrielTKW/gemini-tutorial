import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";
//Structured Output
//1. Directly mention Json Output in Contents
//2. Create a schema and put into responseSchema
dotenv.config();
const bookingFlightSchema = {
  type: SchemaType.OBJECT,
  properties: {
    bookingId: { type: SchemaType.STRING, nullable: false },
    passengerName: { type: SchemaType.STRING, nullable: false },
    flightNumber: { type: SchemaType.STRING, nullable: false },
    departure: { type: SchemaType.STRING, nullable: false },
    arrival: { type: SchemaType.STRING, nullable: false },
    seatNumber: { type: SchemaType.STRING, nullable: false },
    price: { type: SchemaType.NUMBER, nullable: false },
    baggage: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }, // Example: ["Cabin Bag", "Checked Bag"]
      nullable: false,
    },
    payment: {
      type: SchemaType.OBJECT,
      properties: {
        method: {
          type: SchemaType.STRING,
          enum: ["Credit Card", "PayPal", "Bank Transfer"],
          nullable: false,
        },
        status: {
          type: SchemaType.STRING,
          enum: ["Pending", "Completed", "Failed"],
          nullable: false,
        },
      },
      required: ["method", "status"],
    },
  },
  required: [
    "bookingId",
    "passengerName",
    "flightNumber",
    "departure",
    "arrival",
    "seatNumber",
    "price",
    "baggage",
    "payment",
  ],
};

// const model = genAI.getGenerativeModel({
//   model: "gemini-2.0-flash",
// });

// // Generate content using a prompt and the metadata of the uploaded file.
// const result = await model.generateContent([
//   {
//     inlineData: {
//       mimeType: "audio/mp3",
//       data: base64AudioFile,
//     },
//   },
//   {
//     text: "Extract the chinese lyrics in one Paragraph . Then for second paragraph make it english version",
//   },
// ]);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const response = await model.generateContent({
    model: "gemini-2.0-flash",
    contents: "Create me a booking details",
    config: {
      responseMimeType: "application/json",
      responseSchema: bookingFlightSchema,
    },
  });

  console.debug(response.text);
}

main();
