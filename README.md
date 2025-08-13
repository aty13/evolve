# 🧬 Evolve

**Transform Your Prompts, Amplify Your Results**

A web application that transforms vague, unclear prompts into detailed, effective ones using AI-powered prompt engineering best practices.

## Project Structure

```
evolve/
├── frontend/           # Static web frontend
│   ├── index.html     # Main UI
│   ├── style.css      # Styling
│   ├── script.js      # Frontend logic
│   └── package.json   # Frontend dependencies
├── backend/           # Node.js backend
│   ├── server.js      # Local development server
│   ├── api/           # Vercel serverless functions
│   │   └── improve-prompt.js
│   ├── .env          # Environment variables
│   └── package.json  # Backend dependencies
├── CLAUDE.md         # Project documentation
└── README.md         # This file
```

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/evolve.git
cd evolve
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your OpenAI API key
npm run dev
```

### 3. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Add it to `backend/.env` file

### Frontend Only (Port 3001)
```bash
cd frontend
npm run dev
```

## Deployment

**Vercel (Recommended):**
- Deploy backend as serverless functions
- Deploy frontend as static site
- Set `OPENAI_API_KEY` environment variable

## Features

- ✅ AI-powered prompt improvement
- ✅ Before/after comparison
- ✅ Explanation of improvements
- ✅ Copy-to-clipboard functionality
- ✅ Mobile-responsive design

## Tech Stack

**Frontend:** HTML, CSS, Vanilla JavaScript  
**Backend:** Node.js, OpenAI API  
**Deployment:** Vercel