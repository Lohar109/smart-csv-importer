const { GeminiProvider } = require('./geminiProvider');

let cachedProvider = null;

/**
 * Returns a singleton LLM provider instance. Currently backed by Gemini;
 * swap the implementation here to move to OpenAI/Claude without touching callers.
 */
function getLlmProvider() {
  if (!cachedProvider) {
    cachedProvider = new GeminiProvider(process.env.GEMINI_API_KEY, process.env.GEMINI_MODEL);
  }
  return cachedProvider;
}

module.exports = { getLlmProvider };
