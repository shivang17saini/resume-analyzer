import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#0a0a0f; --surface:#111118; --border:#2a2a3a;
    --accent:#6c63ff; --accent2:#ff6584; --accent3:#43e97b;
    --text:#f0f0f8; --muted:#6b6b8a; --card-bg:rgba(255,255,255,0.03);
  }
  body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; min-height:100vh; }
  .app { min-height:100vh; background:var(--bg); position:relative; overflow-x:hidden; }
  .bg-grid { position:fixed; inset:0; background-image:linear-gradient(rgba(108,99,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(108,99,255,0.03) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; z-index:0; }
  .bg-glow { position:fixed; top:-200px; left:50%; transform:translateX(-50%); width:800px; height:500px; background:radial-gradient(ellipse,rgba(108,99,255,0.12) 0%,transparent 70%); pointer-events:none; z-index:0; }
  .container { max-width:780px; margin:0 auto; padding:48px 24px 80px; position:relative; z-index:1; }
  .header { text-align:center; margin-bottom:48px; animation:fadeDown 0.6s ease both; }
  .header-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(108,99,255,0.15); border:1px solid rgba(108,99,255,0.3); color:#a09eff; font-size:11px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; padding:5px 14px; border-radius:100px; margin-bottom:20px; }
  .header-badge::before { content:''; width:6px; height:6px; background:#6c63ff; border-radius:50%; box-shadow:0 0 8px #6c63ff; animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .title { font-family:'Syne',sans-serif; font-size:clamp(32px,6vw,52px); font-weight:800; line-height:1.05; letter-spacing:-0.02em; background:linear-gradient(135deg,#f0f0f8 0%,#a09eff 60%,#ff6584 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:12px; }
  .subtitle { color:var(--muted); font-size:15px; font-weight:300; line-height:1.6; }
  .card { background:var(--card-bg); border:1px solid var(--border); border-radius:20px; padding:32px; margin-bottom:20px; backdrop-filter:blur(10px); animation:fadeUp 0.5s ease both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
  .card-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); margin-bottom:20px; display:flex; align-items:center; gap:8px; }
  .card-title::after { content:''; flex:1; height:1px; background:var(--border); }
  .upload-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:540px){.upload-grid{grid-template-columns:1fr}}
  .upload-zone { border:1.5px dashed var(--border); border-radius:14px; padding:28px 20px; text-align:center; cursor:pointer; transition:all 0.25s ease; background:transparent; position:relative; overflow:hidden; }
  .upload-zone:hover { border-color:var(--accent); background:rgba(108,99,255,0.05); }
  .upload-zone.has-file { border-color:var(--accent3); border-style:solid; background:rgba(67,233,123,0.05); }
  .upload-zone input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; z-index:1; }
  .remove-btn { position:absolute; top:8px; right:8px; width:24px; height:24px; border-radius:50%; background:rgba(255,101,132,0.1); border:1px solid rgba(255,101,132,0.3); color:#ff8fa3; display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer; z-index:10; transition:all 0.2s ease; }
  .remove-btn:hover { background:rgba(255,101,132,0.2); transform:scale(1.1); }
  .upload-icon { font-size:28px; margin-bottom:10px; display:block; }
  .upload-label { font-size:13px; font-weight:500; color:var(--text); display:block; margin-bottom:4px; }
  .upload-hint { font-size:11px; color:var(--muted); }
  .upload-filename { font-size:11px; color:var(--accent3); margin-top:6px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .or-divider { text-align:center; color:var(--muted); font-size:12px; letter-spacing:0.1em; text-transform:uppercase; padding:4px 0; }
  .textarea { width:100%; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:14px 16px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; font-weight:300; resize:vertical; min-height:120px; outline:none; transition:border-color 0.2s ease; line-height:1.6; }
  .textarea:focus { border-color:var(--accent); }
  .textarea::placeholder { color:var(--muted); }
  .btn { width:100%; padding:16px 32px; background:linear-gradient(135deg,#6c63ff,#8b5cf6); border:none; border-radius:14px; color:#fff; font-family:'Syne',sans-serif; font-size:15px; font-weight:700; letter-spacing:0.03em; cursor:pointer; transition:all 0.25s ease; box-shadow:0 4px 32px rgba(108,99,255,0.3); }
  .btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 40px rgba(108,99,255,0.45); }
  .btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .btn-inner { display:flex; align-items:center; justify-content:center; gap:10px; }
  .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.7s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .error-box { background:rgba(255,101,132,0.1); border:1px solid rgba(255,101,132,0.3); border-radius:10px; padding:12px 16px; color:#ff8fa3; font-size:13px; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .results { animation:fadeUp 0.5s ease both; }
  .score-section { text-align:center; padding:40px 32px; background:var(--card-bg); border:1px solid var(--border); border-radius:20px; margin-bottom:20px; position:relative; overflow:hidden; }
  .score-section::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 0%,rgba(108,99,255,0.08) 0%,transparent 70%); }
  .profile-img { width:80px; height:80px; border-radius:50%; border:3px solid var(--accent); object-fit:cover; margin:0 auto 20px; display:block; box-shadow:0 0 24px rgba(108,99,255,0.4); }
  .score-label { font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em; font-weight:600; margin-bottom:8px; }
  .score-number { font-family:'Syne',sans-serif; font-size:80px; font-weight:800; line-height:1; margin-bottom:4px; }
  .score-100 { color:var(--muted); font-size:32px; }
  .score-bar-wrap { background:rgba(255,255,255,0.06); border-radius:100px; height:8px; margin:20px auto 0; max-width:320px; overflow:hidden; }
  .score-bar-fill { height:100%; border-radius:100px; transition:width 1.2s cubic-bezier(0.16,1,0.3,1); }
  .score-breakdown { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:24px; }
  @media(max-width:480px){.score-breakdown{grid-template-columns:1fr}}
  .breakdown-item { background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:14px 10px; text-align:center; }
  .breakdown-val { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; color:var(--accent); }
  .breakdown-key { font-size:11px; color:var(--muted); margin-top:3px; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  @media(max-width:540px){.info-grid{grid-template-columns:1fr}}
  .info-card { background:var(--card-bg); border:1px solid var(--border); border-radius:16px; padding:20px; }
  .info-card-title { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:14px; display:flex; align-items:center; gap:6px; }
  .tag-list { display:flex; flex-wrap:wrap; gap:7px; }
  .tag { background:rgba(108,99,255,0.12); border:1px solid rgba(108,99,255,0.2); color:#a09eff; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:500; }
  .tag.missing { background:rgba(255,101,132,0.1); border-color:rgba(255,101,132,0.2); color:#ff8fa3; }
  .rec-list { list-style:none; display:flex; flex-direction:column; gap:10px; }
  .rec-list li { font-size:13px; color:#c0c0d8; line-height:1.5; padding-left:18px; position:relative; font-weight:300; }
  .rec-list li::before { content:'→'; position:absolute; left:0; color:var(--accent); font-size:12px; }
  .strength-list { list-style:none; display:flex; flex-direction:column; gap:8px; }
  .strength-list li { font-size:13px; color:#c0c0d8; padding-left:18px; position:relative; font-weight:300; }
  .strength-list li::before { content:'✓'; position:absolute; left:0; color:var(--accent3); font-weight:700; }
  .summary-card { background:var(--card-bg); border:1px solid var(--border); border-radius:16px; padding:24px; margin-bottom:16px; }
  .summary-text { font-size:14px; color:#c0c0d8; line-height:1.8; font-weight:300; font-style:italic; }
  .word-count { font-size:11px; color:var(--muted); margin-top:12px; text-align:right; }
  .reset-btn { background:transparent; border:1px solid var(--border); border-radius:10px; color:var(--muted); font-family:'DM Sans',sans-serif; font-size:13px; padding:10px 20px; cursor:pointer; margin-top:8px; transition:all 0.2s ease; display:block; margin-left:auto; }
  .reset-btn:hover { border-color:var(--accent); color:var(--text); }
  .mode-badge { display:inline-block; background:rgba(108,99,255,0.15); border:1px solid rgba(108,99,255,0.3); color:#a09eff; font-size:11px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; padding:4px 12px; border-radius:100px; margin-bottom:16px; }
`;

function getScoreColor(score) {
  if (score >= 80) return '#43e97b';
  if (score >= 60) return '#f9d423';
  return '#ff6584';
}

export default function App() {
  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('geminiApiKey') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Wake up the backend server (Render cold start mitigation)
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    axios.get(`${API_URL}/health`).catch(() => {});
  }, []);

  const handleApiKeyChange = (e) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('geminiApiKey', val);
  };

  const handleSubmit = async () => {
    if (!apiKey) {
      setError('Please provide your Google Gemini API Key.');
      return;
    }
    if (!resume && !photo) {
      setError('Please upload a resume PDF or a profile photo.');
      return;
    }
    setError('');
    setLoading(true);
    const formData = new FormData();
    if (resume) formData.append('resume', resume);
    if (photo) formData.append('photo', photo);
    if (jobDesc) formData.append('jobDescription', jobDesc);
    formData.append('apiKey', apiKey);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Is the backend running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setResume(null); setPhoto(null); setJobDesc(''); setError(''); };

  const isPhotoOnly = result?.mode === 'photo_only';
  const score = isPhotoOnly
    ? (result?.analysis?.photo_score || 0)
    : (result?.analysis?.ats_score || 0);
  const scoreColor = getScoreColor(score);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="bg-grid" /><div className="bg-glow" />
        <div className="container">
          <header className="header">
            <div className="header-badge">AI-Powered ATS Analyzer</div>
            <h1 className="title">Resume Analyzer</h1>
            <p className="subtitle">Upload your resume PDF, a profile photo, or both.<br />Get instant ATS score, skills gap analysis, and feedback.</p>
          </header>

          {!result ? (
            <>
              <div className="card">
                <div className="card-title">Upload Files</div>
                <div className="upload-grid">
                  <div className={`upload-zone ${resume ? 'has-file' : ''}`}>
                    <input key={resume ? resume.name : 'empty-resume'} type="file" accept=".pdf,application/pdf"
                      onChange={e => setResume(e.target.files[0])} />
                    {resume && (
                      <button className="remove-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setResume(null); }}>✕</button>
                    )}
                    <span className="upload-icon">{resume ? '✅' : '📄'}</span>
                    <span className="upload-label">Resume PDF</span>
                    <span className="upload-hint">For ATS score + analysis</span>
                    {resume && <div className="upload-filename">{resume.name}</div>}
                  </div>
                  <div className={`upload-zone ${photo ? 'has-file' : ''}`}>
                    <input key={photo ? photo.name : 'empty-photo'} type="file" accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={e => setPhoto(e.target.files[0])} />
                    {photo && (
                      <button className="remove-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPhoto(null); }}>✕</button>
                    )}
                    <span className="upload-icon">{photo ? '🖼️' : '📸'}</span>
                    <span className="upload-label">Profile Photo</span>
                    <span className="upload-hint">JPG, PNG, WEBP · optional</span>
                    {photo && <div className="upload-filename">{photo.name}</div>}
                  </div>
                </div>
                <div className="or-divider" style={{ marginTop: 14, fontSize: 11, color: '#444' }}>
                  upload either one or both
                </div>
              </div>

              <div className="card">
                <div className="card-title">Job Description</div>
                <textarea className="textarea" rows={5} value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the job description for targeted keyword matching... (optional)" />
              </div>

              <div className="card" style={{ padding: '24px 32px' }}>
                <div className="card-title">🔑 Google Gemini API Key</div>
                <input 
                  type="password" 
                  className="textarea" 
                  style={{ minHeight: '48px', height: '48px', padding: '12px 16px' }}
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Paste your Gemini API Key (starts with AIza...)"
                />
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', lineHeight: '1.4' }}>
                  Your key is stored locally in your browser and used securely to process the analysis. <br/>
                  Get one for free at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '500' }}>Google AI Studio</a>.
                </div>
              </div>

              {error && <div className="error-box">⚠️ {error}</div>}

              <button className="btn" onClick={handleSubmit} disabled={loading}>
                <div className="btn-inner">
                  {loading ? <><div className="spinner" />Analyzing...</> : <><span>⚡</span>Analyze</>}
                </div>
              </button>
            </>
          ) : (
            <div className="results">
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <span className="mode-badge">
                  {isPhotoOnly ? '📸 Photo Analysis' : '📄 Resume Analysis'}
                </span>
              </div>

              <div className="score-section">
                {result.photoUrl && (
                  <img className="profile-img"
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${result.photoUrl}`} alt="Profile" />
                )}
                <div className="score-label">
                  {isPhotoOnly ? 'Professional Photo Score' : 'ATS Compatibility Score'}
                </div>
                <div className="score-number" style={{ color: scoreColor }}>
                  {score}<span className="score-100">/100</span>
                </div>
                <div className="score-bar-wrap">
                  <div className="score-bar-fill" style={{ width: `${score}%`, background: scoreColor }} />
                </div>
                {result.analysis.score_breakdown && (
                  <div className="score-breakdown">
                    {Object.entries(result.analysis.score_breakdown).map(([k, v]) => (
                      <div className="breakdown-item" key={k}>
                        <div className="breakdown-val">{v}</div>
                        <div className="breakdown-key">{k.replace(/_/g, ' ')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {result.analysis.overall_summary && (
                <div className="summary-card">
                  <div className="info-card-title">📝 Summary</div>
                  <p className="summary-text">"{result.analysis.overall_summary}"</p>
                  {result.resumeWordCount > 0 && (
                    <div className="word-count">Resume word count: {result.resumeWordCount}</div>
                  )}
                </div>
              )}

              <div className="info-grid">
                {result.analysis.skills_found?.length > 0 && (
                  <div className="info-card">
                    <div className="info-card-title" style={{ color: '#43e97b' }}>✅ Skills Found</div>
                    <div className="tag-list">
                      {result.analysis.skills_found.map((s, i) => <span className="tag" key={i}>{s}</span>)}
                    </div>
                  </div>
                )}
                {result.analysis.missing_keywords?.length > 0 && (
                  <div className="info-card">
                    <div className="info-card-title" style={{ color: '#ff8fa3' }}>❌ Missing Keywords</div>
                    <div className="tag-list">
                      {result.analysis.missing_keywords.map((s, i) => <span className="tag missing" key={i}>{s}</span>)}
                    </div>
                  </div>
                )}
              </div>

              <div className="info-grid">
                {result.analysis.strengths?.length > 0 && (
                  <div className="info-card">
                    <div className="info-card-title" style={{ color: '#a09eff' }}>💪 Strengths</div>
                    <ul className="strength-list">
                      {result.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {result.analysis.recommendations?.length > 0 && (
                  <div className="info-card">
                    <div className="info-card-title" style={{ color: '#f9d423' }}>💡 Recommendations</div>
                    <ul className="rec-list">
                      {result.analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <button className="reset-btn" onClick={reset}>← Analyze Another</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}