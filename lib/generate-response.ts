import { CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const generateResponse = async (
  messages: CoreMessage[],
  updateStatus?: (status: string) => void,
) => {
  let text = "";
  
  if (updateStatus) updateStatus("Generating response...");
  
  try {
    // Use the Google model with proper type handling
    const model = google("gemini-2.0-flash") as any;
    
    // Add a timeout to the request
    const timeoutPromise = new Promise<{ text: string }>((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out after 30 seconds")), 30000);
    });
    
    // Race between the actual request and the timeout
    const response = await Promise.race([
      generateText({
        model,
        messages,
      }),
      timeoutPromise
    ]);
    
    text = response.text;
  } catch (error) {
    console.error("Error generating response:", error);
    text = "Sorry, I encountered an error while generating a response. Please try again later.";
    
    // Add more detailed error information for debugging
    if (error instanceof Error) {
      console.error(`Error details: ${error.name} - ${error.message}`);
      if (error.stack) console.error(`Stack trace: ${error.stack}`);
      
      // Specific message for timeout errors
      if (error.message.includes("timed out")) {
        text = "Sorry, the response took too long to generate. Please try a shorter or simpler query.";
      }
    }
  }

  // Convert markdown to Slack mrkdwn format
  return text.replace(/\[(.*?)\]\((.*?)\)/g, "<$2|$1>").replace(/\*\*/g, "*");
};
