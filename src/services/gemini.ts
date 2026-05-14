import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiModel = "gemini-3-flash-preview";

export const generateCaption = async (productDetails: any, language: string = 'en') => {
  const prompt = `You are a professional marketing specialist for handicrafts. 
  Generate a professional, warm, and marketplace-ready caption for this product in ${language}.
  Product Details: ${JSON.stringify(productDetails)}
  Include artisan name and traditional techniques if mentioned.
  Keep it concise and appealing for global buyers.`;

  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Handcrafted with love.";
  }
};

export const getSmartSuggestions = async (imageData: string) => {
  const prompt = `Act as a professional product photographer. Analyze this image (base64) and provide 3 short, actionable tips for an artisan to improve the photo. Look for lighting, center alignment, and blur. Return the tips in a simple list.`;

  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ensure good lighting and center the product.";
  }
};
