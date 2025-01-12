import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";

// Add debugging logs
const API_KEY = Constants.expoConfig?.extra?.googleAiKey;
console.log("Checking API configuration...");
console.log("API Key exists:", !!API_KEY); // Will log true/false without exposing the key
console.log("Constants.expoConfig:", !!Constants.expoConfig); // Check if config exists

if (!API_KEY) {
  throw new Error(
    "Google AI API key is not configured. Please check your .env file and app.config.js"
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function fileToGenerativePart(imageUri: string) {
  try {
    console.log("Converting image:", imageUri);
    // Convert the image URI to a Blob
    const response = await fetch(imageUri);
    console.log("Fetch response status:", response.status);
    const blob = await response.blob();
    console.log("Blob size:", blob.size);

    const base64Data = await blobToBase64(blob);
    console.log("Base64 data length:", base64Data.length);

    return {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg",
      },
    };
  } catch (error) {
    console.error("Error in fileToGenerativePart:", error);
    throw error;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        if (typeof reader.result === "string") {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(",")[1];
          console.log("Base64 conversion successful");
          resolve(base64);
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      } catch (error) {
        console.error("Error in reader.onloadend:", error);
        reject(error);
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
}

export const analyzePhoto = async (
  photo: { uri: string },
  language: string
) => {
  try {
    console.log("Starting photo analysis with URI:", photo.uri);
    const imagePart = await fileToGenerativePart(photo.uri);
    console.log("Image converted successfully to GenerativePart");

    const prompt = `Share 2 things that work well in this photo and 3 quick tips to make it even better, in short and clear:.
    Return the feedback exactly in this format:
    Positives:
    - [Positive aspect 1]
    - [Positive aspect 2]
    
    Suggestions:
    - [Suggestion 1]
    - [Suggestion 2]
    - [Suggestion 3]
    `;

    console.log("Sending request to Google AI...");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log("Raw AI response:", text);

    // Use regex to extract the sections
    const positivesMatch = text.match(/Positives:\n((?:- .*\n?)*)/);
    const suggestionsMatch = text.match(/Suggestions:\n((?:- .*\n?)*)/);

    if (!positivesMatch && !suggestionsMatch) {
      throw new Error("Failed to parse AI response");
    }

    const feedback = {
      positives: positivesMatch
        ? positivesMatch[1]
            .split("\n")
            .map((line) => line.trim().replace(/^- /, ""))
            .filter(Boolean)
        : [],
      suggestions: suggestionsMatch
        ? suggestionsMatch[1]
            .split("\n")
            .map((line) => line.trim().replace(/^- /, ""))
            .filter(Boolean)
        : [],
    };

    console.log("Final processed feedback:", feedback);
    return feedback;
  } catch (error) {
    console.error("Error in analyzePhoto:", error);
    throw error;
  }
};
