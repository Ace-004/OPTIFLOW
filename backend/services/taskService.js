const { generateText } = require("./gemini");
const redis = require("../config/redis");

const extractJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : null;
};

exports.analyzeTaskAI = async (description) => {
  const key = `key:${description}`;
  const cached = await redis.safeGet(key);
  if (cached) return JSON.parse(cached);

  const prompt = `
Analyze the Task and return JSON only.

Format:
{
  "summary": "",
  "urgency": 1-5,
  "importance": 1-5,
  "complexity": {
    "cognitive": 1-5,
    "technical": 1-5,
    "dependencies": 1-5,
    "effort": 1-5
  }
}

Task: "${description}"
`;

  const text = await generateText(prompt);
  const result = extractJSON(text);
  if (result) await redis.safeSet(key, JSON.stringify(result), 86400);
  return result;
};
