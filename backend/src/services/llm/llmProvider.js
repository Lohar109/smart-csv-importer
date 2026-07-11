/**
 * Abstract interface every LLM provider must implement.
 * Swap providers (Gemini, OpenAI, Claude) by implementing `generate(prompt)`
 * and returning it from `getLlmProvider()` in llmProviderFactory.js.
 */
class LlmProvider {
  // eslint-disable-next-line no-unused-vars
  async generate(prompt) {
    throw new Error('generate() must be implemented by the provider');
  }
}

module.exports = { LlmProvider };
