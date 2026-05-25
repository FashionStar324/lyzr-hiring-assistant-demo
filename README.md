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
