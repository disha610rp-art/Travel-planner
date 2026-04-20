// Groq AI Service — AI-powered travel suggestions using Groq API

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

/**
 * Make a request to Groq API
 * @param {string} systemPrompt - System message for the AI
 * @param {string} userPrompt - User's query
 * @returns {Promise<string>} AI response text
 */
const callGroq = async (systemPrompt, userPrompt) => {
  if (!API_KEY) {
    throw new Error('Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

/**
 * Parse JSON from AI response (handles markdown code blocks)
 * @param {string} text - Raw AI response
 * @returns {*} Parsed JSON object
 */
const parseJSON = (text) => {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', text);
    throw new Error('AI returned an invalid response format. Please try again.');
  }
};

/**
 * Generate a complete travel itinerary
 * @param {object} params - Trip parameters
 * @param {string} params.destination - Travel destination
 * @param {number} params.days - Number of days
 * @param {string} params.budget - Budget level (low/moderate/high/flexible)
 * @param {number} params.travelers - Number of travelers
 * @param {string} params.preferences - User preferences and notes
 * @returns {Promise<object>} Generated itinerary
 */
export const generateItinerary = async ({ destination, days, budget, travelers, preferences }) => {
  const systemPrompt = `You are an expert travel planner AI. Generate detailed, practical travel itineraries with real places and accurate pricing. Always respond with valid JSON only, wrapped in a markdown code block.`;

  const userPrompt = `Create a ${days}-day travel itinerary for ${destination}.

Details:
- Budget Level: ${budget}
- Number of Travelers: ${travelers}
- Preferences/Notes: ${preferences || 'None specified'}

Respond ONLY with a JSON object in this exact format:
\`\`\`json
{
  "destination": "${destination}",
  "summary": "Brief 2-sentence trip summary",
  "days": [
    {
      "day": 1,
      "title": "Day title/theme",
      "activities": [
        {
          "id": "unique_id",
          "time": "09:00 AM",
          "period": "morning",
          "title": "Activity name",
          "description": "Brief description",
          "location": "Specific place name",
          "duration": "2 hours",
          "estimatedCost": 25,
          "category": "sightseeing|food|transport|activity|shopping"
        }
      ]
    }
  ],
  "totalEstimatedCost": 500,
  "currency": "USD",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}
\`\`\`

Include 4-5 activities per day covering morning, afternoon, and evening. Make cost estimates realistic for the ${budget} budget level. Use unique IDs for each activity (e.g., "d1a1", "d1a2", "d2a1").`;

  const response = await callGroq(systemPrompt, userPrompt);
  return parseJSON(response);
};

/**
 * Get hotel suggestions for a destination
 * @param {string} destination - Travel destination
 * @param {string} budget - Budget level
 * @param {number} nights - Number of nights
 * @returns {Promise<Array>} List of hotel suggestions
 */
export const suggestHotels = async (destination, budget, nights) => {
  const systemPrompt = `You are a travel accommodation expert. Suggest real hotels with accurate information. Respond with valid JSON only.`;

  const userPrompt = `Suggest 5 hotels in ${destination} for a ${budget} budget (${nights} nights).

Respond ONLY with a JSON array:
\`\`\`json
[
  {
    "id": "h1",
    "name": "Hotel name",
    "type": "hotel|hostel|boutique|resort|apartment",
    "pricePerNight": 80,
    "totalPrice": 240,
    "rating": 4.5,
    "location": "Neighborhood/area",
    "amenities": ["WiFi", "Pool", "Breakfast"],
    "description": "Brief description",
    "whyRecommended": "Why this fits the budget/preferences"
  }
]
\`\`\``;

  const response = await callGroq(systemPrompt, userPrompt);
  return parseJSON(response);
};

/**
 * Get restaurant suggestions for a destination
 * @param {string} destination - Travel destination
 * @param {string} budget - Budget level
 * @param {string} preferences - Dietary preferences/allergies
 * @returns {Promise<Array>} List of restaurant suggestions
 */
export const suggestRestaurants = async (destination, budget, preferences) => {
  const systemPrompt = `You are a food and dining expert. Suggest real restaurants with accurate information. Consider dietary restrictions carefully. Respond with valid JSON only.`;

  const userPrompt = `Suggest 6 restaurants in ${destination} for a ${budget} budget.
${preferences ? `Dietary preferences/allergies: ${preferences}` : ''}

Respond ONLY with a JSON array:
\`\`\`json
[
  {
    "id": "r1",
    "name": "Restaurant name",
    "cuisine": "Cuisine type",
    "priceRange": "$|$$|$$$|$$$$",
    "avgMealCost": 15,
    "rating": 4.3,
    "location": "Area/neighborhood",
    "dietaryOptions": ["vegetarian", "vegan", "gluten-free"],
    "speciality": "What they're known for",
    "description": "Brief description"
  }
]
\`\`\``;

  const response = await callGroq(systemPrompt, userPrompt);
  return parseJSON(response);
};

/**
 * Get places to visit suggestions
 * @param {string} destination - Travel destination
 * @param {number} days - Number of days
 * @param {string} preferences - User preferences
 * @returns {Promise<Array>} List of places to visit
 */
export const suggestPlaces = async (destination, days, preferences) => {
  const systemPrompt = `You are a travel attractions expert. Suggest real places to visit with accurate information. Respond with valid JSON only.`;

  const userPrompt = `Suggest 8 must-visit places in ${destination} for a ${days}-day trip.
${preferences ? `Interests: ${preferences}` : ''}

Respond ONLY with a JSON array:
\`\`\`json
[
  {
    "id": "p1",
    "name": "Place name",
    "type": "landmark|museum|park|market|temple|beach|viewpoint|neighborhood",
    "entryFee": 10,
    "estimatedTime": "2-3 hours",
    "rating": 4.7,
    "description": "Brief description",
    "bestTime": "Morning",
    "tips": "Insider tip"
  }
]
\`\`\``;

  const response = await callGroq(systemPrompt, userPrompt);
  return parseJSON(response);
};

/**
 * Generate expense breakdown from itinerary
 * @param {object} itinerary - Generated itinerary object
 * @param {string} budget - Budget level
 * @param {number} travelers - Number of travelers
 * @returns {Promise<object>} Expense breakdown
 */
export const generateExpenseBreakdown = async (itinerary, budget, travelers) => {
  const systemPrompt = `You are a travel budget expert. Create realistic expense breakdowns. Respond with valid JSON only.`;

  const destination = itinerary?.destination || 'the destination';
  const days = itinerary?.days?.length || 3;

  const userPrompt = `Create a detailed expense breakdown for a ${days}-day trip to ${destination} with ${travelers} traveler(s) on a ${budget} budget.

Respond ONLY with a JSON object:
\`\`\`json
{
  "categories": [
    { "name": "Accommodation", "amount": 300, "percentage": 35, "color": "#FFB5C2" },
    { "name": "Food & Dining", "amount": 200, "percentage": 23, "color": "#B5D8FF" },
    { "name": "Transportation", "amount": 150, "percentage": 18, "color": "#D5B5FF" },
    { "name": "Activities & Sightseeing", "amount": 120, "percentage": 14, "color": "#B5FFD8" },
    { "name": "Shopping & Miscellaneous", "amount": 80, "percentage": 10, "color": "#FFD8B5" }
  ],
  "totalEstimated": 850,
  "perPerson": 850,
  "perDay": 283,
  "currency": "USD",
  "savingTips": ["Tip 1", "Tip 2", "Tip 3"]
}
\`\`\`

Make sure percentages add up to 100 and amounts are realistic for the ${budget} budget level.`;

  const response = await callGroq(systemPrompt, userPrompt);
  return parseJSON(response);
};

export default {
  generateItinerary,
  suggestHotels,
  suggestRestaurants,
  suggestPlaces,
  generateExpenseBreakdown,
};
