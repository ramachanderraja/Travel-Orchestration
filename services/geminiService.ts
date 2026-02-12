import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseItem } from "../types";

// Initialize Gemini Client
// Note: In a production app, ensure the API key is strictly backend-managed or properly proxied.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Models
const TEXT_MODEL = 'gemini-3-flash-preview'; 
const VISION_MODEL = 'gemini-2.5-flash-image'; // Using generic image model for receipt analysis validation or extraction

/**
 * Orchestrates a travel request from natural language.
 * E.g., "I need to go to London next week for a 3-day conference."
 */
export const orchestrateTravelRequest = async (prompt: string): Promise<any> => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Extract travel details from the following request. 
      Today is ${new Date().toISOString().split('T')[0]}.
      Calculate specific dates if relative dates (like "next Friday") are used.
      Identify if there are multiple destinations (list them in destination_city).
      Look for any attendees mentioned (defaults to 'Self' if not specified).
      Look for specific accommodation preferences (e.g., 'hotel near airport').
      
      Request: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination_city: { type: Type.STRING, description: "City or comma-separated list of cities" },
            destination_country: { type: Type.STRING },
            departure_date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            return_date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            purpose: { type: Type.STRING },
            estimated_budget: { type: Type.NUMBER },
            summary: { type: Type.STRING, description: "A professional summary of the trip" },
            attendees: { type: Type.STRING, description: "Names of attendees or 'Self'" },
            accommodation_preference: { type: Type.STRING, description: "Specific accommodation needs" }
          },
          required: ["destination_city", "summary"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Orchestration error:", error);
    throw error;
  }
};

/**
 * Analyzes a receipt image or PDF to extract expense details.
 */
export const analyzeReceipt = async (base64Data: string, mimeType: string = 'image/jpeg'): Promise<any> => {
  if (!process.env.API_KEY) return null;

  try {
    // Clean base64 string if it contains metadata header
    const cleanBase64 = base64Data.split(',')[1] || base64Data;

    const response = await ai.models.generateContent({
      model: TEXT_MODEL, // Using V3 Flash as it is multimodal capable and supports schema well
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: "Analyze this receipt/invoice and extract the merchant name, vendor address, date, total amount, tax amount, currency, payment method (e.g., Visa 1234, Cash), and line items.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            vendor_address: { type: Type.STRING },
            date: { type: Type.STRING, description: "YYYY-MM-DD" },
            total: { type: Type.NUMBER },
            tax_amount: { type: Type.NUMBER },
            currency: { type: Type.STRING, description: "Currency code e.g. USD, INR" },
            payment_method: { type: Type.STRING },
            category: { type: Type.STRING, description: "Best guess category e.g., Meals, Transport, Hotel, Flights, Supplies, Entertainment" },
            line_items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                },
              },
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Receipt analysis error:", error);
    throw error;
  }
};

/**
 * Generates a summary of the expense claim based on items.
 */
export const generateExpenseSummary = async (items: ExpenseItem[]): Promise<string | null> => {
  if (!process.env.API_KEY || items.length === 0) return null;

  try {
    const itemsJson = JSON.stringify(items.map(item => ({
      category: item.category,
      amount: item.amount,
      description: item.description,
      merchant: item.merchant,
      currency: item.currency || 'INR'
    })));

    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Generate a concise professional summary (max 2-3 sentences) for this expense claim. Highlight the total spend, primary spend categories, and any major individual expenses. 
      Data: ${itemsJson}`,
    });

    return response.text;
  } catch (error) {
    console.error("Summary generation error:", error);
    return null;
  }
};