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
    
    const response = await generateText({
      model,
      messages,
    });
    
    text = response.text;
  } catch (error) {
    console.error("Error generating response:", error);
    text = "Sorry, I encountered an error while generating a response.";
  }

  // Convert markdown to Slack mrkdwn format
  return text.replace(/\[(.*?)\]\((.*?)\)/g, "<$2|$1>").replace(/\*\*/g, "*");
};
