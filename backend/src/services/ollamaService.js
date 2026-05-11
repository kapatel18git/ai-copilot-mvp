const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.MODEL || 'codellama';

const client = axios.create({
  baseURL: OLLAMA_BASE_URL,
  timeout: 120000, // 2 minute timeout for long requests
});

const checkHealth = async () => {
  try {
    const response = await client.get('/api/tags');
    const models = response.data.models || [];
    const modelExists = models.some(m => m.name.includes(MODEL));

    return {
      status: 'ok',
      baseUrl: OLLAMA_BASE_URL,
      activeModel: MODEL,
      modelAvailable: modelExists,
      availableModels: models.map(m => m.name),
    };
  } catch (error) {
    throw new Error(`Ollama is not running at ${OLLAMA_BASE_URL}`);
  }
};

const generate = async (prompt, options = {}) => {
  try {
    const response = await client.post('/api/generate', {
      model: MODEL,
      prompt,
      stream: false,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.9,
      top_k: options.topK || 40,
      num_predict: options.numPredict || 500,
    });

    return response.data.response || '';
  } catch (error) {
    console.error('Ollama generation error:', error.message);
    throw new Error(`Failed to generate completion: ${error.message}`);
  }
};

const streamGenerate = async (prompt, onChunk, options = {}) => {
  try {
    const response = await client.post('/api/generate', {
      model: MODEL,
      prompt,
      stream: true,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.9,
      top_k: options.topK || 40,
      num_predict: options.numPredict || 500,
    }, {
      responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        try {
          const line = chunk.toString().trim();
          if (line) {
            const json = JSON.parse(line);
            onChunk(json.response || '');
          }
        } catch (e) {
          // Ignore parse errors
        }
      });

      response.data.on('end', resolve);
      response.data.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Failed to stream generation: ${error.message}`);
  }
};

module.exports = {
  checkHealth,
  generate,
  streamGenerate,
};
