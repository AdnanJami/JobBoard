// this is job_form.jsx page
import React, { useState, useEffect } from 'react';
import './job_form.css';
import { useNavigate, useLocation,Navigate } from 'react-router-dom';
import api from '../api';
function Job_form() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
const jobData = location.state?.jobData || null;
const isEditing = !!jobData?.id;
const jobId = jobData?.id || null;
  const [reviewData, setReviewData] = useState({
    JobTitle: '',
    Company: '',
    Skills: [],
    Salary: '',
    Experience: '',
    JobType: 'FULL_TIME',
    Location: '',
    Deadline: '',
    Requirements: [],
    Benefits: [],
    Description: '',
    job_url: '',
    post_text: ''  // To hold the original job post text
  });
const normalizeData = (data) => ({
  JobTitle: data.JobTitle || data.title || '',
  Company: data.Company || data.company || data['Company name'] || '',
  Skills: data.Skills || data.skills || [],
  Salary: data.Salary || data.salary || '',
  Experience: data.Experience || data.experience || '',
  JobType: data.JobType || data.job_type || 'FULL_TIME',
  Location: data.Location || data.location || '',
  Deadline: data.Deadline || data.deadline || '',
  Requirements: data.Requirements || data.requirements || [],
  Benefits: data.Benefits || data.benefits || [],
  Description: data.Description || data.description || '',
  job_url: data.job_url || data.post_url || '',
  post_text: data.post_text || data.original_text || ''
});

  // Load extracted data if available
useEffect(() => {
  // Case 1: coming from extracted data
  if (location.state?.extractedData) {
    setReviewData(normalizeData(location.state.extractedData));
  }
  // Case 2: editing existing job
  else if (location.state?.jobData) {
    setReviewData(normalizeData(location.state.jobData));
  }
}, [location.state]);


  const JOB_TYPES = [
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'REMOTE',
    'INTERNSHIP'
  ];
const handleArrayChange = (field, value) => {
  const array = value.split('\n').map(v => v.trim()).filter(Boolean);
  setReviewData({ ...reviewData, [field]: array });
};


 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const payload = {
      title: reviewData.JobTitle,
      company: reviewData.Company,
      skills: reviewData.Skills,
      salary: reviewData.Salary,
      experience: reviewData.Experience,
      job_type: reviewData.JobType,
      location: reviewData.Location,
      deadline: reviewData.Deadline,
      requirements: reviewData.Requirements,
      benefits: reviewData.Benefits,
      description: reviewData.Description,
      post_url: reviewData.job_url,
      original_text: reviewData.post_text,
      visibility: reviewData.visibility || 'PUBLIC'
    };

    let response;
    if (isEditing && jobId) {
      // 🔁 Update existing job
      response = await api.put(`/api/v1/jobs/${jobId}/`, payload);
      console.log('✅ Job updated:', response.data);
    } else {
      // 🆕 Create new job
      response = await api.post('/api/v1/jobs/', payload);
      console.log('✅ Job created:', response.data);
    }

    setSuccess(true);
    navigate('/');
  } catch (err) {
    console.error('❌ Error saving job:', err.response?.data || err.message);
    setError(err.response?.data?.original_text?.[0] || err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="container-review">
      <div className="card-review">
        <h1 className="title-review">
  {isEditing ? 'Edit Job Details' : 'Review & Submit Job'}
</h1>

        <p className="subtitle-review">Review the extracted information and make any necessary corrections.</p>

        {error && (
          <div className="alert alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✅ Job saved successfully!</span>
          </div>
        )}

        <div className="form-grid">
          <div className="form-group-review">
            <label className="label-review">Job Title *</label>
            <input
              type="text"
              value={reviewData.JobTitle}
              onChange={(e) => setReviewData({ ...reviewData, JobTitle: e.target.value })}
              className="input-review"
              required
            />
          </div>

          <div className="form-group-review">
            <label className="label-review">Company *</label>
            <input
              type="text"
              value={reviewData.Company}
              onChange={(e) => setReviewData({ ...reviewData, Company: e.target.value })}
              className="input-review"
              required
            />
          </div>

          <div className="form-group-review">
            <label className="label-review">Job Type *</label>
            <select
              value={reviewData.JobType}
              onChange={(e) => setReviewData({ ...reviewData, JobType: e.target.value })}
              className="input-review"
              required
            >
              {JOB_TYPES.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="form-group-review">
            <label className="label-review">Location</label>
            <input
              type="text"
              value={reviewData.Location}
              onChange={(e) => setReviewData({ ...reviewData, Location: e.target.value })}
              className="input-review"
            />
          </div>

          <div className="form-group-review">
            <label className="label-review">Salary</label>
            <input
              type="text"
              value={reviewData.Salary}
              onChange={(e) => setReviewData({ ...reviewData, Salary: e.target.value })}
              className="input-review"
            />
          </div>

          <div className="form-group-review">
            <label className="label-review">Experience (years)</label>
            <input
              type="text"
              value={reviewData.Experience}
              onChange={(e) => setReviewData({ ...reviewData, Experience: e.target.value })}
              className="input-review"
            />
          </div>

          <div className="form-group-review">
            <label className="label-review">Deadline</label>
            <input
              type="text"
              value={reviewData.Deadline}
              onChange={(e) => setReviewData({ ...reviewData, Deadline: e.target.value })}
              className="input-review"
              placeholder="e.g., 20th October 2025"
            />
          </div>

          <div className="form-group-review" style={{ gridColumn: 'span 2' }}>
            <label className="label-review">Job URL</label>
            <input
              type="url"
              value={reviewData.job_url}
              onChange={(e) => setReviewData({ ...reviewData, job_url: e.target.value })}
              className="input-review"
            />
          </div>
        </div>

        <div className="form-group-full">
          <label className="label-review">Skills (one per line)</label>
          <textarea
            value={reviewData.Skills.join('\n')}
            onChange={(e) => handleArrayChange('Skills', e.target.value)}
            className="textarea"
            rows="4"
            placeholder="Python&#10;JavaScript&#10;React"
          />
        </div>

        <div className="form-group-full">
          <label className="label-review">Requirements (one per line)</label>
          <textarea
            value={reviewData.Requirements ? reviewData.Requirements.join('\n') : ''}
            onChange={(e) => handleArrayChange('Requirements', e.target.value)}
            className="textarea"
            rows="4"
            placeholder="Bachelor's degree&#10;2+ years experience"
          />
        </div>
                <div className="form-group-full">
          <label className="label-review">Benefits (one per line)</label>
          <textarea
            value={reviewData.Benefits ? reviewData.Benefits.join('\n') : ''}
            onChange={(e) => handleArrayChange('Benefits', e.target.value)}
            className="textarea"
            rows="4"
            placeholder="Free Lunch&#10;Free washrooms&#10;Health Insurance"
          />
        </div>

        <div className="form-group-full">
          <label className="label-review">Description</label>
          <textarea
            value={reviewData.Description}
            onChange={(e) => setReviewData({ ...reviewData, Description: e.target.value })}
            className="textarea"
            rows="6"
          />
        </div>
        <div className="form-group-full">
          <label className="label-review">Original Job Post (read-only)</label>
          <textarea
            value={reviewData.post_text}
            readOnly
            className="textarea"
            rows="8"
          />
        </div>
        <div className="form-group-review">
  <label className="label-review">Visibility *</label>
  <select
    value={reviewData.visibility || 'PUBLIC'}
    onChange={(e) => setReviewData({ ...reviewData, visibility: e.target.value })}
    className="input-review"
    required
  >
    <option value="PUBLIC">Public</option>
    <option value="PRIVATE">Private</option>
    <option value="MUTUAL">Mutual</option>
  </select>
</div>


        <div className="button-group">
          <button
            onClick={() => navigate(-1)}
            className="btn-btn-secondary"
          >
            Back
          </button>
<button
  onClick={handleSubmit}
  disabled={loading || !reviewData.JobTitle || !reviewData.Company}
  className="btn-btn-primary"
>
  {loading
    ? isEditing
      ? '⏳ Updating...'
      : '⏳ Saving...'
    : isEditing
    ? 'Update Job'
    : 'Save Job'}
</button>

        </div>
      </div>
    </div>
  );
}

export default Job_form;