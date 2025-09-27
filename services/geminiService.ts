import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, Recipe, ScannedItem, CategorizedItem } from '../types';
import { getDaysUntilExpiry } from '../utils/dateUtils';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRecipeSuggestions = async (inventory: InventoryItem[]): Promise<Recipe[]> => {
    const sortedInventory = [...inventory].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    const ingredientsList = sortedInventory.map(item => {
        const days = getDaysUntilExpiry(item.expiryDate);
        const expiryInfo = days < 0 ? `(expired ${-days} days ago)` : `(expires in ${days} days)`;
        return `- ${item.name} (${item.quantity}) ${expiryInfo}`;
    }).join('\n');

    const prompt = `
    You are a creative chef's assistant specialized in reducing food waste. I have the following ingredients in my kitchen. Please suggest three distinct recipes that primarily use these ingredients, prioritizing those closest to their expiration date. Also consider common pantry staples I might have (like oil, salt, pepper, flour, sugar, spices).

    My ingredients:
    ${ingredientsList}

    For each recipe, provide a name, a short, enticing description (1-2 sentences), a list of all ingredients needed, and clear, step-by-step instructions. Structure your response as a JSON array of objects.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            recipeName: { type: Type.STRING },
                            description: { type: Type.STRING },
                            ingredients: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            instructions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["recipeName", "description", "ingredients", "instructions"],
                    },
                },
                thinkingConfig: { thinkingBudget: 0 },
            },
        });

        const jsonText = response.text.trim();
        const recipes: Recipe[] = JSON.parse(jsonText);
        return recipes;

    } catch (error) {
        console.error("Error fetching recipe suggestions:", error);
        throw new Error("Failed to get recipe suggestions from AI. Please check your API key and try again.");
    }
};

export const parseReceiptFromImage = async (imageData: string, mimeType: string): Promise<ScannedItem[]> => {
    const prompt = `
    You are an intelligent receipt scanner for a kitchen inventory app. Analyze this image of a grocery receipt and extract only the food items.

    For each item, provide its name and quantity. Ignore all non-food items, taxes, totals, store information, discounts, and other irrelevant details.
    
    Structure your response as a JSON array of objects, where each object has 'name' and 'quantity' keys. If no food items are found, return an empty array.
    `;

    try {
        const imagePart = {
            inlineData: {
                data: imageData,
                mimeType,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            quantity: { type: Type.STRING },
                        },
                        required: ["name", "quantity"],
                    },
                },
                thinkingConfig: { thinkingBudget: 0 },
            },
        });

        const jsonText = response.text.trim();
        const items: ScannedItem[] = JSON.parse(jsonText);
        return items;

    } catch (error) {
        console.error("Error parsing receipt:", error);
        throw new Error("Failed to parse receipt with AI. The image might be unclear or the format is not supported.");
    }
};

export const categorizeItems = async (items: InventoryItem[]): Promise<CategorizedItem[]> => {
    const itemNames = items.map(item => item.name);
    const prompt = `
    You are a food categorization expert for a kitchen inventory app. For each item in the list below, classify it into ONE of the following categories: 'Meat & Fish', 'Vegetable', 'Fruit', 'Dairy & Eggs', 'Grains & Carbs', 'Pantry Staples', 'Beverages', 'Other'.

    Analyze this list: ${JSON.stringify(itemNames)}

    Return your response as a JSON array of objects, where each object has a 'name' and 'category' key. The 'name' must exactly match the item name provided.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            category: { type: Type.STRING },
                        },
                        required: ["name", "category"],
                    },
                },
                thinkingConfig: { thinkingBudget: 0 },
            },
        });
        const jsonText = response.text.trim();
        const categorized: CategorizedItem[] = JSON.parse(jsonText);
        return categorized;

    } catch (error) {
        console.error("Error categorizing items:", error);
        throw new Error("Failed to categorize items with AI.");
    }
};