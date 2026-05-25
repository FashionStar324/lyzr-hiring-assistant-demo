# Lyzr Developer Candidate Screener

An AI-powered resume screening tool built with React + Vite. Paste a job description, upload a candidate's resume, and get an instant fit analysis powered by the [Lyzr](https://www.lyzr.ai/) agent API.

## Features

- Upload resumes in **PDF**, **DOCX**, or **TXT** format
- Paste any job description to analyze against
- Returns a **fit score (0–100)**, verdict, strengths, gaps, and suggested interview questions

## Getting Started

### Prerequisites

- Node.js 18+
- A [Lyzr Studio](https://studio.lyzr.ai/) account with an agent and API key

### Creating the Lyzr Agent

In [Lyzr Studio](https://studio.lyzr.ai/), create a new agent with the following configuration:

| Field | Value |
|---|---|
| **Name** | Developer Hiring Assistant |
| **Description** | Evaluates developer candidates against job descriptions and provides fit scores |
| **Model** | `gpt-4o` (recommended for better results) |
| **Agent Role** | You are an expert technical recruiter who specializes in evaluating software developers. |
| **Agent Goal** | Analyze a job description and a candidate's background, then provide a structured evaluation with a fit score, strengths, red flags, and recommended interview questions. |

**Agent Instructions:**
```
When given a job description and candidate summary:
1. Score the candidate from 1-10 on overall fit
2. List their matching technical skills
3. List any skill gaps or red flags
4. Suggest 3 interview questions tailored to their gaps
Keep your response clear and structured.
```

Once created, copy the **Agent ID** from the agent's settings page.

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/fashionStar324/lyzr-demo.git
cd lyzr-demo
npm install
```

2. Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

```env
VITE_LYZR_API_KEY=your_api_key_here
VITE_LYZR_AGENT_ID=your_agent_id_here
```

3. Start the dev server:

```bash
npm run dev
```

## API Sample

The app calls the Lyzr inference endpoint directly from the browser. Here is the raw request for reference:

**Request**

```http
POST https://agent-prod.studio.lyzr.ai/v3/inference/chat/
Content-Type: application/json
x-api-key: YOUR_LYZR_API_KEY
```

```json
{
  "user_id": "demo-user",
  "agent_id": "YOUR_AGENT_ID",
  "session_id": "session-1748123456789",
  "message": "You are a technical hiring assistant. Analyze the following and return a structured JSON response.\n\nJob Description:\n<job description text>\n\nCandidate Resume:\n<resume text>\n\nReturn ONLY valid JSON in this exact format:\n{\n  \"fit_score\": 82,\n  \"verdict\": \"Strong Fit\",\n  \"strengths\": [\"5+ years React experience\", \"Strong TypeScript skills\"],\n  \"gaps\": [\"No AWS experience\"],\n  \"interview_questions\": [\"Describe your experience with CI/CD pipelines.\"]\n}"
}
```

**Response**

```json
{
  "response": "{\n  \"fit_score\": 82,\n  \"verdict\": \"Strong Fit\",\n  \"strengths\": [\n    \"5+ years of React experience\",\n    \"Strong TypeScript skills\",\n    \"Proven track record with agile teams\"\n  ],\n  \"gaps\": [\n    \"No AWS or cloud infrastructure experience\"\n  ],\n  \"interview_questions\": [\n    \"How have you approached deployment pipelines in past projects?\",\n    \"Can you describe a time you had to learn a new cloud service quickly?\",\n    \"What strategies do you use to ensure frontend performance at scale?\"\n  ]\n}"
}
```

The `response` field contains a JSON string which the app parses to render the fit score, strengths, gaps, and interview questions.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Tech Stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [pdfjs-dist](https://github.com/mozilla/pdf.js) — PDF text extraction
- [mammoth](https://github.com/mwilliamson/mammoth.js) — DOCX text extraction
- [Lyzr Agent API](https://studio.lyzr.ai/) — AI analysis
