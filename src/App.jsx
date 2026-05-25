import { useState, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import './App.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href

const LYZR_API_KEY = import.meta.env.VITE_LYZR_API_KEY
const LYZR_AGENT_ID = import.meta.env.VITE_LYZR_AGENT_ID

async function extractText(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'pdf') {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pages = await Promise.all(
      Array.from({ length: pdf.numPages }, (_, i) =>
        pdf.getPage(i + 1).then((p) => p.getTextContent()).then((c) =>
          c.items.map((item) => item.str).join(' ')
        )
      )
    )
    return pages.join('\n')
  }

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer()
    const { value } = await mammoth.extractRawText({ arrayBuffer })
    return value
  }

  // txt / plain text fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

async function screenCandidate(jobDescription, resumeText) {
  const prompt = `You are a technical hiring assistant. Analyze the following and return a structured JSON response.

Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Return ONLY valid JSON in this exact format:
{
  "fit_score": <number 0-100>,
  "verdict": "<Strong Fit | Good Fit | Partial Fit | Poor Fit>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "interview_questions": ["<question 1>", "<question 2>", "<question 3>"]
}`

  const res = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LYZR_API_KEY,
    },
    body: JSON.stringify({
      user_id: 'demo-user',
      agent_id: LYZR_AGENT_ID,
      message: prompt,
      session_id: `session-${Date.now()}`,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data?.response ?? data?.message ?? JSON.stringify(data)

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Could not parse structured response from agent.')
  return JSON.parse(jsonMatch[0])
}

const scoreColor = (score) => {
  if (score >= 75) return '#16a34a'
  if (score >= 50) return '#d97706'
  return '#dc2626'
}

export default function App() {
  const [jobDescription, setJobDescription] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const acceptFile = (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.')
      return
    }
    setResumeFile(file)
    setError(null)
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    acceptFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!jobDescription.trim() || !resumeFile) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const resumeText = await extractText(resumeFile)
      if (!resumeText.trim()) throw new Error('Could not extract text from the resume file.')
      const data = await screenCandidate(jobDescription, resumeText)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">⚡ Lyzr</div>
        <h1>Developer Candidate Screener</h1>
        <p>Paste a job description and upload a resume to get an instant AI-powered fit analysis.</p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="jd">Job Description</label>
          <textarea
            id="jd"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={7}
            required
          />
        </div>

        <div className="field">
          <label>Candidate Resume</label>
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''} ${resumeFile ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              style={{ display: 'none' }}
              onChange={(e) => acceptFile(e.target.files[0])}
            />
            {resumeFile ? (
              <div className="file-info">
                <span className="file-icon">📄</span>
                <div>
                  <div className="file-name">{resumeFile.name}</div>
                  <div className="file-size">{(resumeFile.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  type="button"
                  className="remove-file"
                  onClick={(e) => { e.stopPropagation(); setResumeFile(null); setResult(null) }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="upload-prompt">
                <span className="upload-icon">⬆</span>
                <div className="upload-text">Drop resume here or <span className="upload-link">browse</span></div>
                <div className="upload-hint">PDF, DOCX, or TXT</div>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading || !resumeFile}>
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Analyzing...' : 'Screen Candidate'}
        </button>
      </form>

      {error && (
        <div className="error-box">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="results">
          <div className="score-card">
            <div className="score-ring" style={{ '--score-color': scoreColor(result.fit_score) }}>
              <span className="score-number">{result.fit_score}</span>
              <span className="score-label">/ 100</span>
            </div>
            <div className="verdict" style={{ color: scoreColor(result.fit_score) }}>
              {result.verdict}
            </div>
          </div>

          <div className="sections">
            <section className="section">
              <h2>Strengths</h2>
              <ul>
                {result.strengths.map((s, i) => (
                  <li key={i} className="strength-item">{s}</li>
                ))}
              </ul>
            </section>

            <section className="section">
              <h2>Gaps</h2>
              <ul>
                {result.gaps.map((g, i) => (
                  <li key={i} className="gap-item">{g}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="section full-width">
            <h2>Suggested Interview Questions</h2>
            <ol className="questions-list">
              {result.interview_questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  )
}
