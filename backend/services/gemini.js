// Gemini fallback configuration
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Ordered list of models to try – primary first, then fallbacks
const GEMINI_MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
  "gemini-3-flash-preview",
];

/**
 * Get a model instance for the given model name.
 */
function getModel(name) {
  return genAI.getGenerativeModel({
    model: name,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
}

/**
 * Generate text using the first available Gemini model.
 * Tries each model in order; if one fails (e.g., 404 or quota), it falls back
 * to the next. Throws an error only if all models fail.
 */
exports.generateText = async function (prompt) {
  for (const modelName of GEMINI_MODELS) {
    const model = getModel(modelName);
    try {
      const result = await model.generateContent(prompt);
      console.log('using model ',model);
      return result.response.text();
    } catch (err) {
      console.warn(`Gemini model ${modelName} failed: ${err.message || err}`);
      // Continue to next fallback model
    }
  }
  // If we get here, every model has failed
  throw new Error("All Gemini models failed – unable to generate text");
};
