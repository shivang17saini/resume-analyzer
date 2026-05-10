const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/analyze', upload.fields([{ name: 'resume' }, { name: 'photo' }]), async (req, res) => {
    try {
        const resumeFile = req.files?.['resume']?.[0] || null;
        const photoFile = req.files?.['photo']?.[0] || null;
        const userApiKey = req.body.apiKey;

        if (!userApiKey) {
            return res.status(400).json({ error: 'A valid Google Gemini API Key is required.' });
        }

        if (!resumeFile && !photoFile)
            return res.status(400).json({ error: 'Please upload a resume PDF or a profile photo.' });

        const genAI = new GoogleGenerativeAI(userApiKey);

        const jobContext = req.body.jobDescription
            ? `\n\nJob Description:\n${req.body.jobDescription}` : '';

        // ── PHOTO ONLY mode ──
        if (!resumeFile && photoFile) {
            const b64 = fs.readFileSync(photoFile.path).toString('base64');
            const mime = photoFile.mimetype || 'image/jpeg';

            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });
            const prompt = `Analyze this professional profile photo. Return ONLY JSON:
{
  "ats_score": null,
  "score_breakdown": null,
  "photo_score": <0-100>,
  "skills_found": [],
  "missing_keywords": [],
  "strengths": [<professional photo strengths>],
  "recommendations": [<photo improvement tips>],
  "overall_summary": "<professional suitability summary>"
}`;
            const imagePart = {
                inlineData: { data: b64, mimeType: mime }
            };
            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();

            return res.json({
                success: true, mode: 'photo_only',
                analysis: JSON.parse(responseText),
                photoUrl: `/uploads/${photoFile.filename}`,
                resumeWordCount: 0
            });
        }

        // ── RESUME (+ optional photo) mode ──
        const fileBuffer = fs.readFileSync(resumeFile.path);
        const pdfBase64 = fileBuffer.toString('base64');

        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: { responseMimeType: 'application/json' }
        });
        const prompt = `You are an expert ATS resume analyzer. Respond ONLY with valid JSON.
Analyze this resume. Return ONLY this JSON:
{
  "ats_score": <0-100>,
  "score_breakdown": { "keyword_match": <0-100>, "formatting": <0-100>, "experience_clarity": <0-100> },
  "skills_found": [<strings>],
  "missing_keywords": [<strings>],
  "strengths": [<strings>],
  "recommendations": [<strings>],
  "overall_summary": "<string>"
}
${jobContext}`;
        
        const filePart = { inlineData: { data: pdfBase64, mimeType: 'application/pdf' } };
        const result = await model.generateContent([prompt, filePart]);
        const responseText = result.response.text();

        res.json({
            success: true, mode: 'resume',
            analysis: JSON.parse(responseText),
            photoUrl: photoFile ? `/uploads/${photoFile.filename}` : null,
            resumeWordCount: 0 // Handled natively by Gemini
        });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message || 'Unexpected error.' });
    }
});

app.listen(process.env.PORT || 5000, () => console.log('✅ Backend running on port 5000'));