// frontend/src/pages/Post_Job.jsx
import { useState } from 'react';
import './Post_Job.css';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Post_Job() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [extractForm, setExtractForm] = useState({
    post_text: '',
    job_url: ''
  });

  const handleExtract = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/v1/extract-job/', extractForm);
      const data = response.data;
      console.log('Extracted Data:', data);

      // Navigate to job form with extracted data
      navigate('/job-form', { 
                              state: { 
                                extractedData: data, 
                                jobUrl: extractForm.job_url,
                                originalText: extractForm.post_text   // ✅ include original text
                              } 
                            });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Extract Job Information</h1>
        <p className="subtitle">Paste the job posting text below to automatically extract structured data.</p>

        {error && (
          <div className="alert alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="label">Job Post Text *</label>
          <textarea
            value={extractForm.post_text}
            onChange={(e) => setExtractForm({ ...extractForm, post_text: e.target.value })}
            className="textarea"
            rows="12"
            placeholder="Paste the complete job posting here..."
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Job URL (Optional)</label>
          <input
            type="url"
            value={extractForm.job_url}
            onChange={(e) => setExtractForm({ ...extractForm, job_url: e.target.value })}
            className="input"
            placeholder="https://example.com/job-posting"
          />
        </div>

        <div className='button-space'>
          <button
            onClick={handleExtract}
            disabled={loading || !extractForm.post_text}
            className="btn-btn-primary"
          >
            {loading ? '⏳ Extracting...' : 'Extract Job Info'}
          </button>
          <button
            onClick={() => navigate('/job-form')}
            className="btn-btn-secondary"
          >
            ✍️ Fill Manually
          </button>
        </div>
      </div>
    </div>
  );
}

export default Post_Job;