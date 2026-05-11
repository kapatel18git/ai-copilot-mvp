const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const ollamaService = require('./services/ollamaService');
const promptBuilder = require('./services/promptBuilder');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const ollamaHealth = await ollamaService.checkHealth();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      ollama: ollamaHealth,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Ollama service not available',
      details: error.message,
    });
  }
});

// Code Completion
app.post('/api/complete', async (req, res) => {
  try {
    const { code, language, context } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const prompt = promptBuilder.buildCompletePrompt(code, language, context);
    const response = await ollamaService.generate(prompt);

    res.json({
      id: uuidv4(),
      action: 'complete',
      completion: response.trim(),
      language,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Code Explanation
app.post('/api/explain', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const prompt = promptBuilder.buildExplainPrompt(code, language);
    const response = await ollamaService.generate(prompt);

    res.json({
      id: uuidv4(),
      action: 'explain',
      explanation: response.trim(),
      language,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bug Detection & Fix
app.post('/api/fix', async (req, res) => {
  try {
    const { code, language, description } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const prompt = promptBuilder.buildFixPrompt(code, language, description);
    const response = await ollamaService.generate(prompt);

    res.json({
      id: uuidv4(),
      action: 'fix',
      suggestion: response.trim(),
      language,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Generation
app.post('/api/test', async (req, res) => {
  try {
    const { code, language, framework } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const prompt = promptBuilder.buildTestPrompt(code, language, framework);
    const response = await ollamaService.generate(prompt);

    res.json({
      id: uuidv4(),
      action: 'test',
      test: response.trim(),
      language,
      framework,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Documentation Generation
app.post('/api/docs', async (req, res) => {
  try {
    const { code, language, style } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const prompt = promptBuilder.buildDocsPrompt(code, language, style);
    const response = await ollamaService.generate(prompt);

    res.json({
      id: uuidv4(),
      action: 'docs',
      documentation: response.trim(),
      language,
      style,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Copilot Backend running on http://localhost:${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}/api/health`);
});
