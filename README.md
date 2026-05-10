# 📄 Resume Analyzer

> I built this because I wanted to analyze my own resume — so I made it myself.

An AI-powered resume analyzer that gives you an **ATS compatibility score**, extracts your skills, finds missing keywords, and gives you real actionable feedback — just like a recruiter's ATS system would evaluate your resume.

---

## ✨ Features

- 📊 **ATS Score** — Get a 0–100 compatibility score for your resume
- 🔍 **Score Breakdown** — Keyword match, formatting, and experience clarity scores
- ✅ **Skills Found** — All skills and technologies detected in your resume
- ❌ **Missing Keywords** — Keywords you should add to pass ATS filters
- 💪 **Strengths** — What your resume does well
- 💡 **Recommendations** — Specific improvements to increase your score
- 🎯 **Job Description Matching** — Paste a job description for targeted analysis
- 📸 **Photo Analysis** — Upload just a profile photo for professional suitability feedback
- 🌙 **Dark UI** — Clean, modern dark-themed interface

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Axios |
| Backend | Node.js, Express |
| AI | Google Gemini 2.5 Flash / Google AI Studio |
| PDF Parsing | pdf-parse |
| File Uploads | Multer |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- A Google AI Studio API key → [aistudio.google.com](https://aistudio.google.com)

### 1. Clone the repository
```bash
git clone https://github.com/shivang17saini/resume-analyzer.git
cd resume-analyzer
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:
```
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

Start the backend:
```bash
node server.js
```
You should see: `✅ Backend running on port 5000`

### 3. Setup Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**

---

## 📁 Project Structure

```
resume-analyzer/
├── backend/
│   ├── uploads/          # Uploaded files (auto-created)
│   ├── server.js         # Express API server
│   ├── package.json
│   └── .env              # Your API key (never commit this)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   └── index.js
│   └── package.json
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check if backend is running |
| POST | `/analyze` | Analyze resume / photo |

### POST `/analyze` — Form Data fields

| Field | Type | Required |
|---|---|---|
| `resume` | PDF file | Optional (if photo provided) |
| `photo` | Image file | Optional (if resume provided) |
| `jobDescription` | String | Optional |

---

## 💡 How It Works

1. User uploads a resume PDF and/or profile photo
2. Backend passes the file buffers directly to Google Gemini
3. The data is sent to Gemini 2.5 Flash with a structured prompt
4. Gemini returns a JSON object with scores, skills, and recommendations
5. Frontend renders the results in a clean dashboard

---

## ⚠️ Important Notes

- The `.env` file is **gitignored** — never commit your API key
- Uploaded files are stored locally in `backend/uploads/`
- Requires a Google account to get the AI Studio API Key

---

## 🙋‍♂️ Author

**Shivang Saini**  
Built this to analyze my own resume and learn full-stack AI development.

---

## 📜 License

MIT — feel free to use and modify for your own projects.
