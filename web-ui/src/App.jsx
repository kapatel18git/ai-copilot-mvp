import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const BACKEND_URL = 'http://localhost:3000'

function App() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [backendOnline, setBackendOnline] = useState(false)
  const [action, setAction] = useState('complete')

  useEffect(() => {
    checkBackend()
  }, [])

  const checkBackend = async () => {
    try {
      await axios.get(`${BACKEND_URL}/api/health`)
      setBackendOnline(true)
    } catch (error) {
      setBackendOnline(false)
    }
  }

  const handleRequest = async (endpoint) => {
    if (!code.trim()) {
      alert('Please enter some code')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/api/${endpoint}`, {
        code,
        language,
      })
      setOutput(response.data)
    } catch (error) {
      setOutput({ error: `Error: ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 AI Copilot</h1>
        <p>Local AI coding assistant powered by Ollama</p>
        <div className={`status ${backendOnline ? 'online' : 'offline'}`}>
          {backendOnline ? '✅ Backend Online' : '❌ Backend Offline'}
        </div>
      </header>

      <div className="container">
        <div className="editor-section">
          <div className="controls">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>
          <textarea
            className="editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
          />
        </div>

        <div className="actions">
          <button
            onClick={() => {
              setAction('complete')
              handleRequest('complete')
            }}
            disabled={loading || !backendOnline}
          >
            {loading && action === 'complete' ? '⏳' : '✨'} Complete
          </button>
          <button
            onClick={() => {
              setAction('explain')
              handleRequest('explain')
            }}
            disabled={loading || !backendOnline}
          >
            {loading && action === 'explain' ? '⏳' : '📖'} Explain
          </button>
          <button
            onClick={() => {
              setAction('fix')
              handleRequest('fix')
            }}
            disabled={loading || !backendOnline}
          >
            {loading && action === 'fix' ? '⏳' : '🐛'} Fix
          </button>
          <button
            onClick={() => {
              setAction('test')
              handleRequest('test')
            }}
            disabled={loading || !backendOnline}
          >
            {loading && action === 'test' ? '⏳' : '🧪'} Test
          </button>
          <button
            onClick={() => {
              setAction('docs')
              handleRequest('docs')
            }}
            disabled={loading || !backendOnline}
          >
            {loading && action === 'docs' ? '⏳' : '📝'} Docs
          </button>
        </div>

        <div className="output-section">
          <h2>Output</h2>
          <pre className="output">
            {output ? JSON.stringify(output, null, 2) : 'Output will appear here...'}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default App
