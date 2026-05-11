# Setup Guide for AI Copilot MVP

## Prerequisites

- **Node.js** 16+ (download from [nodejs.org](https://nodejs.org))
- **Ollama** (download from [ollama.ai](https://ollama.ai))
- **VS Code** 1.60+ (optional, for extension)

## Step 1: Install Ollama

1. Download Ollama from [ollama.ai](https://ollama.ai)
2. Install following the instructions for your OS
3. Open terminal and run:

```bash
ollama pull codellama
```

This downloads the CodeLlama model (~4-7GB). First time might take a while.

4. Start Ollama server:

```bash
ollama serve
```

You should see: `Listening on 127.0.0.1:11434`

**Keep this terminal running!**

## Step 2: Setup Backend

In a **new terminal**, navigate to the project root:

```bash
cd backend
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Verify `.env` contents:

```env
OLLAMA_BASE_URL=http://localhost:11434
MODEL=codellama
PORT=3000
```

Start the backend:

```bash
npm start
```

You should see: `🚀 AI Copilot Backend running on http://localhost:3000`

**Keep this terminal running!**

## Step 3 (Optional): Install VS Code Extension

In a **new terminal**:

```bash
cd vscode-extension
npm install
```

Compile TypeScript:

```bash
npm run compile
```

Or watch for changes:

```bash
npm run watch
```

### Load Extension in VS Code

1. Open VS Code
2. Press `F5` to open extension in debug mode
3. A new VS Code window opens with the extension loaded

### Available Keybindings

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Complete | Ctrl+Alt+C | Cmd+Alt+C |
| Explain | Ctrl+Alt+E | Cmd+Alt+E |
| Fix Bug | Ctrl+Alt+F | Cmd+Alt+F |
| Generate Test | Ctrl+Alt+T | Cmd+Alt+T |
| Generate Docs | Ctrl+Alt+D | Cmd+Alt+D |

## Step 4 (Optional): Install Web UI

In a **new terminal**:

```bash
cd web-ui
npm install
npm run dev
```

Open: http://localhost:5173

## Step 5 (Optional): Install CLI Tool

In a **new terminal**:

```bash
cd cli
npm install
```

### Using CLI

Check health:

```bash
node src/cli.js health
```

Complete code:

```bash
node src/cli.js complete
```

Explain code:

```bash
node src/cli.js explain
```

Find & fix bugs:

```bash
node src/cli.js fix
```

Generate tests:

```bash
node src/cli.js test
```

Generate documentation:

```bash
node src/cli.js docs
```

Read from file:

```bash
node src/cli.js complete --file myfile.js
```

## Troubleshooting

### "Ollama is not running"

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it:
ollama serve
```

### "Cannot find module 'codellama'"

```bash
# Pull the model again
ollama pull codellama
```

### "Backend connection refused"

Make sure backend is running:

```bash
cd backend
npm start
```

### "Port 3000 already in use"

```bash
# Change port in backend/.env
PORT=3001

# Then update frontend URLs if needed
```

### Slow responses

- First request loads the model (5-10 seconds) - this is normal
- Subsequent requests should be faster (2-5 seconds)
- If running on laptop: close other apps to free up RAM
- Consider GPU acceleration if available

## Performance Optimization

### For Faster Inference

1. **Use a smaller model**:

```bash
ollama pull mistral  # Smaller, faster
# Then update backend/.env: MODEL=mistral
```

2. **Increase Ollama memory** (advanced):

```bash
# macOS/Linux
export OLLAMA_NUM_GPU=1
ollama serve
```

3. **Use GPU acceleration** (if available):
   - NVIDIA CUDA supported models run on GPU
   - Check Ollama docs for your hardware

## Next Steps

1. Try different models: `ollama pull mistral`, `ollama pull neural-chat`
2. Customize prompts in `backend/src/services/promptBuilder.js`
3. Add more languages in the UI selectors
4. Deploy backend to cloud (Heroku, Railway, etc.)
5. Package extension for VS Code marketplace

## API Reference

All endpoints require JSON POST with `code` field.

### POST /api/complete

```json
{
  "code": "function add(a, b) {",
  "language": "javascript",
  "context": "Complete this function"
}
```

### POST /api/explain

```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript"
}
```

### POST /api/fix

```json
{
  "code": "function bug() { let x; return x.name; }",
  "language": "javascript",
  "description": "Crashes when x is null"
}
```

### POST /api/test

```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript",
  "framework": "jest"
}
```

### POST /api/docs

```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript",
  "style": "jsdoc"
}
```

### GET /api/health

No parameters needed.

## Support

For issues, check:

1. Ollama is running: `curl http://localhost:11434/api/tags`
2. Backend is running: `curl http://localhost:3000/api/health`
3. Port conflicts: `lsof -i :3000` (macOS/Linux)
4. Node version: `node --version` (should be 16+)
