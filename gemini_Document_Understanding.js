import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';

//Try input with 
//Extract me the Receipt in JSON , bank , bankid etc
//Who is mentioned in this PDF

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

const pdfPath = "C:\\Users\\3842351\\Documents\\Work\\gemini-tutorial\\content\\Example.pdf"

const result = await model.generateContent([
    {
        inlineData: {
            data: Buffer.from(fs.readFileSync(pdfPath)).toString("base64"),
            mimeType: "application/pdf",
        },
    },
    'Who is mentioned in this PDF',
]);
console.log(result.response.text());