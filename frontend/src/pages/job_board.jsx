// this is job_board.jsx page
import './job_board.css'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
function JobBoard() {
  const navigate = useNavigate();

  // States
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null); // For modal
  const [appliedJobs, setAppliedJobs] = useState([]); // Track applied jobs
  const [deleteJobConfirm, setDeleteJobConfirm] = useState(false);
  const [savedJobs,setSavedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
const [filterType, setFilterType] = useState('all');
const highlightText = (text, searchTerm) => {
  if (!text || !searchTerm) return text;
  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex chars
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark style="background-color: yellow;">$1</mark>');
};


const filteredJobs = jobs.filter((job) => {
const matchesSearch =
  job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (Array.isArray(job.skills) && job.skills.some(
    (skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())
  ));


  const isSaved = savedJobs.includes(job.id);
  const isApplied = appliedJobs.includes(job.id);

  if (filterType === 'saved' && !isSaved) return false;
  if (filterType === 'applied' && !isApplied) return false;

  return matchesSearch;
});
  // Fetch jobs from API
const getJobs = async () => {
  setLoading(true);
  try {
    const response = await api.get('/api/v1/jobs/');
    setJobs(response.data);
  } catch (err) {
    setError(err.response?.data?.detail || err.message);
  } finally {
    setLoading(false);
  }
};
  const getAppliedJobs = async () => {
    try {
      const response = await api.get('/api/v1/applied-jobs/');
      const appliedJobIds = response.data.map((item) => item.job || item.job_id || item.id);
      setAppliedJobs(appliedJobIds);
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
    }
  };
  const postAppliedJob = async (jobId) => {
    try {
      await api.post('/api/v1/applied-jobs/', { job_id: jobId });
      setAppliedJobs((prev) => [...prev, jobId]);
    } catch (err) {
      console.error('Error applying to job:', err);
    }
  };
  const deleteAppliedJob = async (jobId) => {
  try {
    await api.delete('/api/v1/applied-jobs/', { data: { job_id: jobId } });
    setAppliedJobs((prev) => prev.filter((id) => id !== jobId));
  } catch (err) {
    console.error('Error unapplying to job:', err);
  }
};
const deleteJob = async (jobId) => {
  try {
    await api.delete(`/api/v1/jobs/${jobId}/`);
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(null); // Close modal if the deleted job is open
    }
  } catch (err) {
    console.error('Error deleting job:', err);
  }
};
const getSavedJobs = async () => {
    try {
      const response = await api.get('/api/v1/saved-jobs/');
      const savedJobIds = response.data.map((item) => item.job || item.job_id || item.id);
      setSavedJobs(savedJobIds);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  };
  const postSavedJob = async (jobId) => {
    try {
      await api.post('/api/v1/saved-jobs/', { job_id: jobId });
      setSavedJobs((prev) => [...prev, jobId]);
    } catch (err) {
      console.error('Error saving to job:', err);
    }
  };
  const deleteSavedJob = async (jobId) => {
  try {
    await api.delete('/api/v1/saved-jobs/', { data: { job_id: jobId } });
    setSavedJobs((prev) => prev.filter((id) => id !== jobId));
  } catch (err) {
    console.error('Error unsaving to job:', err);
  }
};

  // On component mount fetch jobs
  useEffect(() => {
    getAppliedJobs();
  }, []);
    useEffect(() => {
    getSavedJobs();
  }, []);

  useEffect(() => {
    getJobs();
  }, []);

  // Open modal
  const handleShow = (job) => setSelectedJob(job);
  const handleClose = () => setSelectedJob(null);

  // Apply / Unapply job

const handleApply = async (jobId) => {
  if (appliedJobs.includes(jobId)) {
    await deleteAppliedJob(jobId);  // 👈 Unapply
  } else {
    await postAppliedJob(jobId);    // 👈 Apply
  }
};

  // Save / Unsave job

const handleSave = async (jobId) => {
  if (savedJobs.includes(jobId)) {
    await deleteSavedJob(jobId);  // 👈 Unapply
  } else {
    await postSavedJob(jobId);    // 👈 Apply
  }
};


  return (
    <div className='job-board-container'>
      <div className='header-section'>
        <h1>Job Board</h1>
        <p>Welcome to the Job Board page!</p>
        {/* 🔍 Filter & Search Controls */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search"
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Jobs</option>
            <option value="saved">Saved Jobs</option>
            <option value="applied">Applied Jobs</option>
          </select>
        </div>

      </div>

      {loading && <p>Loading jobs...</p>}
      {error && <p className="text-red-500">⚠️ {error}</p>}

      {filteredJobs.map((job) => (
        <div key={job.id} className='job-card' onClick={() => handleShow(job)}>
          <div className='job-card-header'>
            <div className='job-titles'>
              <div className="title"
               dangerouslySetInnerHTML={{ __html: highlightText(job.title, searchTerm) }}
              />
              <p className="company-name"
              dangerouslySetInnerHTML={{ __html: highlightText(job.company, searchTerm) }}
              />
            </div>
          <div className='job-card-actions' >
            <button
              onClick={(e) => { e.stopPropagation(); handleApply(job.id); }}
              className={appliedJobs.includes(job.id) ? "button-applied" : "button-not-applied"}
            >
              {appliedJobs.includes(job.id) ? "✓ Applied" : "Apply Now"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSave(job.id); }}
              className={savedJobs.includes(job.id) ? "button-saved" : "button-not-saved"}
            >
              {savedJobs.includes(job.id) ? "★ Saved" : "☆ Save"}
            </button>
          </div>
          </div>
          <p className="description"
          dangerouslySetInnerHTML={{ __html: highlightText(job.description || '', searchTerm) }}
          />
          <p className="location">Location: {job.location}</p>

          <div className="skills-section">
            {job.skills && job.skills.map((skill, i) => (
              <div key={i} className="skill-tab"
              dangerouslySetInnerHTML={{ __html: highlightText(skill || '', searchTerm) }}
              />
            ))}
          </div>
          <div className="job-poster" >
            Posted by: {job.posted_by_username || 'N/A'}
          </div>
        </div>
      ))}

      {/* Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className='job-titles'>
                <div className="title">{selectedJob.title}</div>
                <p className="company-name">{selectedJob.company}</p>
                <p className="location-comp">{selectedJob.location}</p>
                <label className="label-review">{selectedJob.job_type}</label>
              </div>
              <button className="close-button" onClick={handleClose}>&times;</button>
            </div>

            <div className="modal-body">
              <p className="description">{selectedJob.description}</p>
              <h3>Salary: {selectedJob.salary || 'N/A'}</h3>
              <h3>Experience: {selectedJob.experience || 'N/A'}</h3>

              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div className="skills-section">
                  <h3>Skills:</h3>
                  {selectedJob.skills.map((skill, i) => (
                    <div key={i} className="skill-tab">{skill}</div>
                  ))}
                </div>
              )}

              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div className="requirement-section">
                  <h3>Requirements:</h3>
                  <ul>
                    {selectedJob.requirements.map((req, i) => <li key={i}>{req}</li>)}
                  </ul>
                </div>
              )}

              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div className="benefits-section">
                  <h3>Benefits:</h3>
                  <ul>
                    {selectedJob.benefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
                  </ul>
                </div>
              )}

              <p className='dead-line'>Application Deadline: {selectedJob.deadline || 'N/A'}</p>

              {selectedJob.original_text && (
                <div className="original-post">
                  <h3>Original Post:</h3>
                  <pre>{selectedJob.original_text}</pre>
                </div>
              )}

              {selectedJob.post_url && (
                <div className="post-link">
                  Post link: <a href={selectedJob.post_url} target="_blank" rel="noopener noreferrer">{selectedJob.post_url}</a>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <p style={{ marginRight: 'auto' }} >
                Posted by: {selectedJob.posted_by_username || 'N/A'}
              </p>
              
              <button
                onClick={(e) => { e.stopPropagation(); handleSave(selectedJob.id); }}
                className={savedJobs.includes(selectedJob.id) ? "button-saved" : "button-not-saved"}
              >
                {savedJobs.includes(selectedJob.id) ? "★ Saved" : "☆ Save"}
              </button>
              <button
                onClick={() => handleApply(selectedJob.id)}
                className={appliedJobs.includes(selectedJob.id) ? "button-applied" : "button-not-applied"}
              >
                {appliedJobs.includes(selectedJob.id) ? "✓ Applied" : "Apply Now"}
              </button>

              {selectedJob.posted_by === localStorage.getItem('username') && ( 
                <> 
                <button onClick={() => navigate('/job-form', { state: { edit: true, jobData: selectedJob } })} className="editing" > Edit </button> 
                <button className="delete-btn" onClick={() => setDeleteJobConfirm(true)} > Delete </button> 
                </> 
              )}
            </div>
          {deleteJobConfirm && (
  <div className="confirm-delete-modal" onClick={() => setDeleteJobConfirm(false)}>
    <div className="confirm-delete-content" onClick={(e) => e.stopPropagation()}>
      <p>Are you sure you want to delete this job?</p>
      <div className="confirm-delete-actions">
        <button
          onClick={() => {
            deleteJob(selectedJob.id);
            setDeleteJobConfirm(false);
          }}
          className="confirm-button"
        >
          Yes, Delete
        </button>
        <button onClick={() => setDeleteJobConfirm(false)} className="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
          </div>
        </div>
      )}
    </div>
  );
}

export default JobBoard