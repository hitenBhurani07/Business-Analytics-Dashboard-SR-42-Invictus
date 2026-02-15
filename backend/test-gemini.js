const { GoogleGenerativeAI } = require("@google/generative-ai");

// Directly hardcode key for testing
const API_KEY = "AIzaSyC5BRAPYIueY3SwNy1wNql1NOZPxUl2W9I";

const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = "Write a haiku about coding";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("SUCCESS! ✅");
    console.log("Response:", text);
  } catch (error) {
    console.error("Full Error:", error);
  }
}

test();