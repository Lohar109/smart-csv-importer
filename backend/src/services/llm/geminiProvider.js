const { GoogleGenerativeAI } = require('@google/generative-ai');

const { LlmProvider } = require('./llmProvider');

class GeminiProvider extends LlmProvider {
  constructor(apiKey, modelName) {
    super();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName || 'gemini-flash-latest';
  }

  async generate(prompt) {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

module.exports = { GeminiProvider };
