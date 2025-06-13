import React, { useEffect, useState } from 'react';
import './HrDashboard.css';
import Navbar from './NavBar.js';
import './NavBar.css';
import axios from 'axios';

const HrDashboard = () => {
  // State management
  const [userData, setUserData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    nature_of_role: '',
    location: '',
    education_requirement: '',
    work_experience: '',
    extra_skills: '',
    salary: '',
    link: '',
    recruiter_email: '',
    job_requirements: '',
    skills_needed: '',
    industry: '',
    deadline: '',
  });
  const [editingJobId, setEditingJobId] = useState(null);
  const [isHR, setIsHR] = useState(false);
  const [expandedApplicant, setExpandedApplicant] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [rejectedCandidates, setRejectedCandidates] = useState([]);
  const [autoEvaluationStatus, setAutoEvaluationStatus] = useState(null);
  const [autoEvaluationResults, setAutoEvaluationResults] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [loading, setLoading] = useState({
    jobs: false,
    applicants: false,
    notification: false,
    evaluation: false
  });

  const toggleJobForm = () => {
  if (showJobForm && editingJobId) {
    // If closing the form while in edit mode, reset editing state
    setEditingJobId(null);
    resetForm();
  }
  setShowJobForm(!showJobForm);
};

const closeApplicantsSection = () => {
  setSelectedJobId(null);
  setApplications([]);
  setExpandedApplicant(null);
};

  const downloadCandidateCV = (jobId, candidateId, candidateName) => {
    axios.get(`http://127.0.0.1:5000/hr/download-cv/${jobId}/${candidateId}`, {
      responseType: 'blob'
    })
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CV_${candidateName.replace(' ', '_')}.${response.headers['content-type'].includes('pdf') ? 'pdf' : 'docx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch(error => {
      console.error('Error downloading CV:', error);
      alert('Failed to download CV');
    });
  };

  // Fetch user data and jobs on component mount
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('role');

    if (role === 'hr') setIsHR(true);

    if (!userId) {
      alert('User not logged in!');
      window.location.href = '/login';
      return;
    }

    axios.get(`http://127.0.0.1:5000/hr/${userId}`)
      .then((response) => setUserData(response.data))
      .catch((error) => {
        console.error('Error fetching user data:', error);
        alert('Failed to fetch user data.');
      });

    fetchJobs();
  }, []);

  // Fetch all job postings
  const fetchJobs = () => {
    setLoading(prev => ({ ...prev, jobs: true }));
    axios.get('http://127.0.0.1:5000/jobs')
      .then((response) => {
        setJobs(response.data);
        setLoading(prev => ({ ...prev, jobs: false }));
      })
      .catch((error) => {
        console.error('Error fetching jobs:', error);
        alert('Failed to fetch jobs.');
        setLoading(prev => ({ ...prev, jobs: false }));
      });
  };

  // Fetch applicants for a specific job
  const fetchJobApplicants = (jobId) => {
    setLoading(prev => ({ ...prev, applicants: true }));
    setSelectedJobId(jobId);
    setExpandedApplicant(null);
    setSelectedCandidates([]);
    setRejectedCandidates([]);
    setAutoEvaluationStatus(null);
    setAutoEvaluationResults(null);
    setNotificationStatus(null);
    
    axios.get(`http://127.0.0.1:5000/hr/job-candidates/${jobId}`)
      .then((response) => {
        const applicants = response.data;
        const feedbackPromises = applicants.map((applicant) => {
          if (applicant.cv_id) {
            return axios.get(`http://127.0.0.1:5000/api/sbert-feedback/${jobId}/${applicant.cv_id}`)
              .then((feedbackResponse) => ({
                ...applicant,
                sbert_score: feedbackResponse.data.sbert_score,
                feedback_message: feedbackResponse.data.feedback_message,
                matching_items: feedbackResponse.data.matching_items || [],
                missing_items: feedbackResponse.data.missing_items || []
              }));
          }
          return Promise.resolve(null);
        });

        Promise.all(feedbackPromises)
          .then((applicantsWithFeedback) => {
            const validApplicants = applicantsWithFeedback.filter(Boolean);
            const rankedApplicants = validApplicants.sort(
              (a, b) => parseFloat(b.sbert_score) - parseFloat(a.sbert_score)
            );
            setApplications(rankedApplicants);
            setLoading(prev => ({ ...prev, applicants: false }));
          })
          .catch((error) => {
            console.error('Error fetching feedback:', error);
            alert('Failed to fetch feedback for applicants.');
            setLoading(prev => ({ ...prev, applicants: false }));
          });
      })
      .catch((error) => {
        console.error('Error fetching applicants:', error);
        alert('Failed to fetch job applicants.');
        setLoading(prev => ({ ...prev, applicants: false }));
      });
  };

  // Automatically evaluate candidates based on SBERT scores
  const handleAutoEvaluateCandidates = () => {
    if (!selectedJobId) return;
    
    setLoading(prev => ({ ...prev, evaluation: true }));
    setAutoEvaluationStatus('Evaluating candidates...');
    setAutoEvaluationResults(null);
    
    axios.post(`http://127.0.0.1:5000/hr/auto-evaluate-candidates/${selectedJobId}`)
      .then(response => {
        setAutoEvaluationStatus('Evaluation completed');
        setAutoEvaluationResults(response.data.results);
        setSelectedCandidates(response.data.results.selected);
        setRejectedCandidates(response.data.results.rejected);
        setLoading(prev => ({ ...prev, evaluation: false }));
      })
      .catch(error => {
        console.error('Error auto-evaluating candidates:', error);
        setAutoEvaluationStatus('Evaluation failed');
        alert('Failed to automatically evaluate candidates');
        setLoading(prev => ({ ...prev, evaluation: false }));
      });
  };

  // Automatically evaluate and notify candidates
  const handleAutoNotifyCandidates = () => {
    if (!selectedJobId) return;
    
    if (window.confirm('This will automatically evaluate AND notify all candidates. Continue?')) {
      setLoading(prev => ({ ...prev, evaluation: true, notification: true }));
      setAutoEvaluationStatus('Processing...');
      
      axios.post(`http://127.0.0.1:5000/hr/auto-notify-candidates/${selectedJobId}`)
        .then(response => {
          const results = response.data.results;
          setAutoEvaluationStatus('Processing completed');
          setAutoEvaluationResults(results);
          
          alert(`Automatic notifications sent:
Selected: ${results.selected_success.length} successful, ${results.selected_failed.length} failed
Rejected: ${results.rejected_success.length} successful, ${results.rejected_failed.length} failed
${results.errors.length} errors`);
          
          fetchJobApplicants(selectedJobId);
          setLoading(prev => ({ ...prev, evaluation: false, notification: false }));
        })
        .catch(error => {
          console.error('Error auto-notifying candidates:', error);
          setAutoEvaluationStatus('Processing failed');
          alert('Failed to automatically notify candidates');
          setLoading(prev => ({ ...prev, evaluation: false, notification: false }));
        });
    }
  };

  // Manually notify selected candidates
  const handleNotifyCandidates = () => {
    if (!selectedJobId) return;
    
    if (selectedCandidates.length === 0 && rejectedCandidates.length === 0) {
      alert('Please select at least one candidate to notify');
      return;
    }

    if (window.confirm(`Are you sure you want to send notifications to:
    - ${selectedCandidates.length} selected candidates
    - ${rejectedCandidates.length} rejected candidates?`)) {
      setLoading(prev => ({ ...prev, notification: true }));
      setNotificationStatus('Sending notifications...');
      
      axios.post(`http://127.0.0.1:5000/hr/manual-notify-candidates/${selectedJobId}`, {
        selected: selectedCandidates,
        rejected: rejectedCandidates
      })
      .then((response) => {
        const results = response.data.results;
        alert(`Notifications sent successfully!
Selected candidates notified: ${results.selected_success.length}
Rejected candidates notified: ${results.rejected_success.length}
Failures: ${results.selected_failed.length + results.rejected_failed.length}`);
        setNotificationStatus(null);
        setSelectedCandidates([]);
        setRejectedCandidates([]);
        setLoading(prev => ({ ...prev, notification: false }));
      })
      .catch(error => {
        console.error('Error sending notifications:', error);
        setNotificationStatus('Failed to send notifications');
        alert('Failed to send notifications');
        setLoading(prev => ({ ...prev, notification: false }));
      });
    }
  };

  // Toggle applicant details view
  const toggleApplicantDetails = (applicantId) => {
    setExpandedApplicant(expandedApplicant === applicantId ? null : applicantId);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle job form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');
    const currentDate = new Date();
    const deadlineDate = new Date(formData.deadline);

    if (deadlineDate < currentDate) {
      alert('Deadline cannot be in the past');
      return;
    }

    if (editingJobId) {
      if (window.confirm('Are you sure you want to update this job?')) {
        axios
          .put(`http://127.0.0.1:5000/hr/edit-job/${editingJobId}`, {
            ...formData,
            hr_user_id: userId,
          })
          .then(() => {
            alert('Job updated successfully!');
            setEditingJobId(null);
            resetForm();
            fetchJobs();
          })
          .catch((error) => {
            console.error('Error updating job:', error);
            alert('Failed to update job.');
          });
      }
    } else {
      axios
        .post('http://127.0.0.1:5000/hr/post-job', {
          ...formData,
          hr_user_id: userId,
        })
        .then(() => {
          alert('Job posted successfully!');
          resetForm();
          fetchJobs();
        })
        .catch((error) => {
          console.error('Error posting job:', error);
          alert('Failed to post job.');
        });
    }
  };

  // Reset job form
  const resetForm = () =>
    setFormData({
      company_name: '',
      job_title: '',
      nature_of_role: '',
      location: '',
      education_requirement: '',
      work_experience: '',
      extra_skills: '',
      salary: '',
      link: '',
      recruiter_email: '',
      job_requirements: '',
      skills_needed: '',
      industry: '',
      deadline: '',
    });

  // Handle job deletion
  const handleDelete = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job and all its associated applications?')) {
      axios
        .delete(`http://127.0.0.1:5000/hr/delete-job/${jobId}`)
        .then(() => {
          setJobs(jobs.filter((job) => job.id !== jobId));
          if (selectedJobId === jobId) {
            setSelectedJobId(null);
            setApplications([]);
          }
          alert('Job and all associated applications deleted successfully!');
        })
        .catch((error) => {
          console.error('Error deleting job:', error);
          alert('Failed to delete job and applications.');
        });
    }
  };

  // Handle job editing
  const handleEdit = (job) => {
    setEditingJobId(job.id);
    setFormData({ ...job });
    setShowJobForm(true);
    window.scrollTo({
    top: 200,
    behavior: 'smooth'
  });
  };


  // Toggle candidate selection
  const toggleCandidateSelection = (candidateId, isSelected) => {
    if (isSelected) {
      setSelectedCandidates([...selectedCandidates, candidateId]);
      setRejectedCandidates(rejectedCandidates.filter(id => id !== candidateId));
    } else {
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    }
  };

  // Toggle candidate rejection
  const toggleCandidateRejection = (candidateId, isRejected) => {
    if (isRejected) {
      setRejectedCandidates([...rejectedCandidates, candidateId]);
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    } else {
      setRejectedCandidates(rejectedCandidates.filter(id => id !== candidateId));
    }
  };

  // Download feedback as PDF
  const downloadFeedbackPDF = (jobId, cvId) => {
    window.open(`http://127.0.0.1:5000/feedback-pdf/${jobId}/${cvId}`);
  };

  // Download feedback as DOCX
  const downloadFeedbackDOCX = (jobId, cvId) => {
    window.open(`http://127.0.0.1:5000/api/generate-feedback-docx/${jobId}/${cvId}`);
  };

  return ( 
    <div className="hr-dashboard">
      <Navbar />
      
      {userData ? (
        <>
          <div className="dashboard-header">
            <div className="welcome-section">
              <h1>Welcome, {userData.name}</h1>
              <p>HR Dashboard</p>
            </div>
            {isHR && (
              <button 
                onClick={toggleJobForm} 
                className="add-job-button"
              >
                {showJobForm ? 'Cancel' : 'Add New Job'}
              </button>
            )}
          </div>

          {showJobForm && (
            <form onSubmit={handleSubmit} className="job-form">
              <h2>{editingJobId ? 'Edit Job' : 'Post a New Job'}</h2>
              <div className="form-grid">
                {Object.keys(formData).map((field) => (
                  <div key={field} className="form-field">
                    <label>
                      {field.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </label>
                    <input
                      type={field === 'deadline' ? 'date' : 'text'}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  {editingJobId ? 'Update Job' : 'Post Job'}
                </button>
                <button 
  type="button" 
  className="cancel-button"
  onClick={() => {
    setShowJobForm(false);
    if (editingJobId) {
      setEditingJobId(null);
      resetForm();
    }
  }}
>
  Cancel
</button>
              </div>
            </form>
          )}

          <h2>Job Postings</h2>
          {loading.jobs ? (
            <div className="loading-spinner">Loading jobs...</div>
          ) : (
            <table className="job-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Title</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Deadline</th>
                  {isHR && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <React.Fragment key={job.id}>
                      <tr className={selectedJobId === job.id ? 'selected-row' : ''}>
                        <td>{job.company_name}</td>
                        <td>{job.job_title}</td>
                        <td>{job.nature_of_role}</td>
                        <td>{job.location}</td>
                        <td>
                          {job.deadline}
                          {new Date(job.deadline) < new Date() && <span className="expired-badge"> (Expired)</span>}
                        </td>
                        {isHR && (
                          <td className="action-buttons">
                            <button onClick={() => handleEdit(job)} className="edit-button">
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(job.id)} 
                              className="delete-button"
                            >
                              Delete
                            </button>
                            <button 
                              onClick={() => fetchJobApplicants(job.id)} 
                              className="view-applicants-button"
                              disabled={loading.applicants}
                            >
                              {loading.applicants && selectedJobId === job.id ? 'Loading...' : 'View Applicants'}
                            </button>
                          </td>
                        )}
                      </tr>
                      {selectedJobId === job.id && (
                        <tr className="applicants-row">
                          <td colSpan={isHR ? 6 : 5}>
                            <div className="applicants-section">
                              <div className="applicants-header">
                                <h3>
                                  Applicants for: {job.job_title}
                                  {loading.applicants && <span className="loading-text"> (Loading...)</span>}
                                </h3>
                                
                                <div className="auto-evaluation-section">
                                  <div className="auto-evaluation-controls">
                                    <button 
                                      onClick={handleAutoEvaluateCandidates}
                                      className="auto-evaluate-button"
                                      disabled={applications.length === 0 || loading.evaluation}
                                    >
                                      {loading.evaluation ? 'Evaluating...' : 'Auto-Evaluate'}
                                    </button>
                                    <button 
                                      onClick={handleAutoNotifyCandidates}
                                      className="auto-notify-button"
                                      disabled={applications.length === 0 || loading.evaluation || loading.notification}
                                    >
                                      {loading.notification ? 'Notifying...' : 'Auto-Evaluate & Notify'}
                                    </button>
                                  </div>
                                  {autoEvaluationStatus && (
                                    <div className="auto-evaluation-status">
                                      Status: {autoEvaluationStatus}
                                    </div>
                                  )}
                                  {autoEvaluationResults && (
                                    <div className="auto-evaluation-results">
                                      <p>Selected: {autoEvaluationResults.selected?.length || 0} candidates</p>
                                      <p>Rejected: {autoEvaluationResults.rejected?.length || 0} candidates</p>
                                      {autoEvaluationResults.errors?.length > 0 && (
                                        <p className="error-text">Errors: {autoEvaluationResults.errors.length}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="applicants-controls-container">
                                <div className="candidate-lists">
                                  <div className="selected-candidates">
                                    <h5>Selected Candidates ({selectedCandidates.length})</h5>
                                    {selectedCandidates.length > 0 ? (
                                      <ul>
                                        {applications
                                          .filter(app => selectedCandidates.includes(app.candidate_id))
                                          .map(app => (
                                            <li key={app.candidate_id}>
                                              {app.candidate_name} - (Score: {app.sbert_score}%)
                                            </li>
                                          ))
                                        }
                                      </ul>
                                    ) : (
                                      <p>No candidates selected yet</p>
                                    )}
                                  </div>

                                  <div className="rejected-candidates">
                                    <h5>Rejected Candidates ({rejectedCandidates.length})</h5>
                                    {rejectedCandidates.length > 0 ? (
                                      <ul>
                                        {applications
                                          .filter(app => rejectedCandidates.includes(app.candidate_id))
                                          .map(app => (
                                            <li key={app.candidate_id}>
                                              {app.candidate_name} - (Score: {app.sbert_score}%)
                                            </li>
                                          ))
                                        }
                                      </ul>
                                    ) : (
                                      <p>No candidates rejected yet</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="notification-controls-section">
                                  <div className="notification-controls">
                                    <div className="selection-summary">
                                      Selected: {selectedCandidates.length} | Rejected: {rejectedCandidates.length}
                                    </div>
                                    {notificationStatus && <span className="notification-status">{notificationStatus}</span>}
                                    <button 
                                      onClick={handleNotifyCandidates}
                                      className="notify-button"
                                      disabled={
                                        (selectedCandidates.length === 0 && rejectedCandidates.length === 0) || 
                                        loading.notification
                                      }
                                    >
                                      {loading.notification ? 'Sending...' : 'Notify Candidates'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              <table className="applicant-table">
                                <thead>
                                  <tr>
                                    <th className="select-col">Select</th>
                                    <th className="reject-col">Reject</th>
                                    <th>Rank</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Score</th>
                                    <th>Feedback</th>
                                    <th>Details</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {applications.map((applicant, index) => (
                                    <React.Fragment key={applicant.candidate_id}>
                                      <tr className={`
                                        ${selectedCandidates.includes(applicant.candidate_id) ? 'selected' : ''}
                                        ${rejectedCandidates.includes(applicant.candidate_id) ? 'rejected' : ''}
                                      `}>
                                        <td>
                                          <input
                                            type="checkbox"
                                            checked={selectedCandidates.includes(applicant.candidate_id)}
                                            onChange={(e) => toggleCandidateSelection(applicant.candidate_id, e.target.checked)}
                                          />
                                        </td>
                                        <td>
                                          <input
                                            type="checkbox"
                                            checked={rejectedCandidates.includes(applicant.candidate_id)}
                                            onChange={(e) => toggleCandidateRejection(applicant.candidate_id, e.target.checked)}
                                          />
                                        </td>
                                        <td>{index + 1}</td>
                                        <td>{applicant.candidate_name}</td>
                                        <td>{applicant.candidate_email}</td>
                                        <td>{applicant.sbert_score}%</td>
                                        <td className="feedback-cell">{applicant.feedback_message}</td>
                                        <td>
                                          <button
                                            onClick={() => toggleApplicantDetails(applicant.candidate_id)}
                                            className="details-button"
                                          >
                                            {expandedApplicant === applicant.candidate_id ? 'Hide' : 'Show'} Details
                                          </button>
                                        </td>
                                      </tr>
                                      {expandedApplicant === applicant.candidate_id && (
                                        <tr className="applicant-details">
                                          <td colSpan="8">
                                            <div className="details-container">
                                              <div className="matching-section">
                                                <h4>Matching Items:</h4>
                                                {applicant.matching_items.length > 0 ? (
                                                  <ul>
                                                    {applicant.matching_items.map((item, i) => (
                                                      <li key={i}>
                                                        <strong>{item.field}:</strong><br />
                                                        <span className="job-data">Job: {item.job_data}</span><br />
                                                        <span className="cv-data">CV: {item.cv_data}</span>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                ) : (
                                                  <p>No matching items found.</p>
                                                )}
                                              </div>
                                              <div className="missing-section">
                                                <h4>Missing Items:</h4>
                                                {applicant.missing_items.length > 0 ? (
                                                  <ul>
                                                    {applicant.missing_items.map((item, i) => (
                                                      <li key={i}>
                                                        <strong>{item.field}:</strong><br />
                                                        <span className="job-data">Job: {item.job_data}</span><br />
                                                        <span className="cv-data">CV: {item.cv_data || 'Not found'}</span>
                                                      </li>
                                                    ))}
                                                  </ul>
                                                ) : (
                                                  <p>No missing items found.</p>
                                                )}
                                              </div>

                                              
                                            </div>
                                            <div className="download-feedback-buttons">
                                                <button 
                                                  onClick={() => downloadFeedbackPDF(selectedJobId, applicant.cv_id)}
                                                  className="download-button"
                                                >
                                                  Download Feedback as PDF
                                                </button>
                                                <button 
                                                  onClick={() => downloadFeedbackDOCX(selectedJobId, applicant.cv_id)}
                                                  className="download-button"
                                                >
                                                  Download Feedback as DOCX
                                                </button>
                                                <button 
                                                  onClick={() => downloadCandidateCV(selectedJobId, applicant.candidate_id, applicant.candidate_name)}
                                                  className="download-button"
                                                >
                                                  Download CV
                                                </button>
                                              </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </table>
                              <div className="close-applicants-container">
                                <button 
                                  onClick={closeApplicantsSection}
                                  className="close-applicants-button"
                                >
                                  Close
                                </button>
                              </div>    
                            </div>
                            
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isHR ? 6 : 5}>No jobs posted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <p className="loading-message">Loading user data...</p>
      )}
    </div>
  );
};

export default HrDashboard;