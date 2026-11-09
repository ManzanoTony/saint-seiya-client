import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client using Vite environment variable
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

/**
 * Fetches dynamic threat alert.
 */
export async function fetchSanctuaryAlert() {
  try {
    const prompt = `
      You are the tactical radar for Athena's Sanctuary during a Holy War against Hades.
      Generate a short, intense threat alert (1-2 sentences max).
      Return ONLY valid JSON in this exact format:
      {
        "enemy": "Name of Specter or Threat",
        "location": "Sanctuary Location (e.g. 1st Temple of Aries)",
        "description": "Short threat description",
        "requiredCosmos": 100
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    // Parse and return the generated event text
    const text = response.text;
    // Clean up any extra markdown code block formatting if Gemini wraps it in ```json
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to fetch threat alert from Gemini:", error);
    // Fallback default alert in case network or quota drops
    return {
      enemy: "Skeleton Soldiers",
      location: "Sanctuary Perimeter Gate",
      description: "A small group of Hades foot soldiers are testing the outer barrier!",
      requiredCosmos: 50,
    };
  }
}
