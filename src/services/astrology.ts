import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface BirthDetails {
  dob: string;
  tob: string;
  pob: string;
}

export interface AstroResult {
  personChart: string;
  indianSpouseProfile: string;
  westernSpouseProfile: string;
  combinedBestProfile: string;
  potentialBirthDates: {
    date: string;
    reason: string;
  }[];
}

export async function calculateMatch(details: BirthDetails): Promise<AstroResult> {
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    You are an expert in both Indian (Vedic) and Western Astrology.
    A person was born on ${details.dob} at ${details.tob} in ${details.pob}.
    
    1. Calculate their basic birth chart (Vedic and Western).
    2. Based on their chart, determine the "Best Combination" for their spouse in Indian Astrology (Nakshatras, Guna Milan principles, 7th house placements, etc.).
    3. Determine the "Best Combination" for their spouse in Western Astrology (Synastry principles, Sun/Moon/Venus/Mars signs, 7th house, etc.).
    4. Synthesize a "Combined Best" profile that merges the strengths of both systems.
    5. Search for specific dates within a range of 20 years older to 20 years younger than ${details.dob} when the planetary configurations most closely matched this "Combined Best" profile. Provide at least 15 specific dates or narrow windows.
    
    Return the result in JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personChart: { type: Type.STRING, description: "Summary of the person's own chart." },
          indianSpouseProfile: { type: Type.STRING, description: "Detailed Indian astrology spouse profile." },
          westernSpouseProfile: { type: Type.STRING, description: "Detailed Western astrology spouse profile." },
          combinedBestProfile: { type: Type.STRING, description: "Synthesis of both systems." },
          potentialBirthDates: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: "The specific date (YYYY-MM-DD)." },
                reason: { type: Type.STRING, description: "Why this date is a good match." }
              },
              required: ["date", "reason"]
            }
          }
        },
        required: ["personChart", "indianSpouseProfile", "westernSpouseProfile", "combinedBestProfile", "potentialBirthDates"]
      }
    }
  });

  return JSON.parse(response.text);
}
