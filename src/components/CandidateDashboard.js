import React, { useEffect, useState, useCallback } from 'react';
import './CandidateDashboard.css';
import Navbar from './NavBar.js';
import './NavBar.css';
import axios from 'axios';

const CandidateDashboard = () => {
  // State management
  const [userData, setUserData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [showStatusNotification, setShowStatusNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filters, setFilters] = useState({
    jobType: '',
    location: '',
    minSalary: '',
  });
  const [statusList, setStatusList] = useState([]);

  // API calls
  const fetchApplicationStatus = async (userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/candidate/application-status/${userId}`);
      const statuses = response.data;
      const sortedStatuses = statuses.sort((a, b) => 
        new Date(b.last_updated) - new Date(a.last_updated)
      );
      return sortedStatuses;
    } catch (error) {
      console.error('Error fetching application status:', error);
      return [];
    }
  };

  const fetchAppliedJobs = async (userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/candidate/applied-jobs/${userId}`);
      setAppliedJobs(response.data);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch applied jobs.');
    }
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await axios.get('http://127.0.0.1:5000/jobs');
      const currentDate = new Date();
      const activeJobs = response.data.filter(job => {
        const deadline = new Date(job.deadline);
        return deadline >= currentDate;
      });
      setAllJobs(activeJobs);
      setJobs(activeJobs);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch jobs.');
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/candidate/${userId}`);
      setUserData(response.data);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch user data.');
    } finally {
      setLoadingUserData(false);
    }
  };

  // Event handlers
  const handleViewStatus = async () => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      const statuses = await fetchApplicationStatus(userId);
      setStatusList(statuses);
      setShowStatusNotification(true);
    }
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
  };

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (file && (
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )) {
      setCvFile(file);
    } else {
      alert('Please upload a valid file (PDF, DOC, DOCX).');
    }
  };

  const handleSubmitApplication = async (e) => {
  e.preventDefault();
  const userId = localStorage.getItem('user_id');
  setIsSubmitting(true); // Add this line

  if (!userId || !selectedJob || !cvFile) {
    alert('Please upload a CV before submitting.');
    setIsSubmitting(false); // Add this line
    return;
  }

  const formData = new FormData();
  formData.append('candidate_id', userId);
  formData.append('job_id', selectedJob.id);
  formData.append('cv', cvFile);

  try {
    await axios.post('http://127.0.0.1:5000/candidate/apply-job', formData);
    alert('Successfully applied for the job!');
    fetchAppliedJobs(userId);
    setSelectedJob(null);
    setCvFile(null);
    fetchApplicationStatus(userId);
  } catch (error) {
    console.error('Error applying for job:', error.response || error.message);
    alert('Failed to apply for the job. Please try again later.');
  } finally {
    setIsSubmitting(false); // Add this line
  }
};

  const hasApplied = (jobId) => {
    return appliedJobs.some((job) => job.id === jobId);
  };

  const generateJobDescription = (job) => {
    return `
${job.job_title} role at ${job.company_name}, which is a ${job.nature_of_role.toLowerCase()} position based in ${job.location}.\n
The ideal candidate should have education in ${job.education_requirement}, with work experience in ${job.work_experience}.\n
Skills required include ${job.skills_needed}. Extra skills like ${job.extra_skills} are a plus.\n
Job requirements include: ${job.job_requirements}.\n
This position belongs to the ${job.industry} industry, offering a salary of ${job.salary}.\n
To apply or learn more, visit: ${job.link}.\n
The deadline to apply is ${new Date(job.deadline).toLocaleDateString()}.
`;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      jobType: '',
      location: '',
      minSalary: '',
    });
  };

  const applyFilters = useCallback(() => {
    let filteredJobs = [...allJobs];

    if (filters.jobType) {
      filteredJobs = filteredJobs.filter(
        job => job.nature_of_role.toLowerCase().includes(filters.jobType.toLowerCase())
      );
    }

    if (filters.location) {
      filteredJobs = filteredJobs.filter(
        job => job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minSalary) {
      filteredJobs = filteredJobs.filter(
        job => {
          const jobSalary = parseFloat(job.salary.replace(/[^0-9.]/g, ''));
          return jobSalary >= parseFloat(filters.minSalary);
        }
      );
    }

    setJobs(filteredJobs);
  }, [allJobs, filters.jobType, filters.location, filters.minSalary]);

  // Effects
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('User not logged in');
      return;
    }

    fetchUserData(userId);
    fetchJobs();
    fetchAppliedJobs(userId);
    fetchApplicationStatus(userId);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allJobs, applyFilters]);

  return (
  <div className="candidate-dashboard">
    {loadingUserData ? (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    ) : userData ? (
      <div>
        <Navbar />
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-message">
              <h1>Welcome back, {userData.name}</h1>
              <p>{userData.email}</p>
            </div>
            <button 
              className="btn btn-status" 
              onClick={handleViewStatus}
              aria-label="View application status"
            >
              View Application Status
            </button> 
          </div>
        </div>

        {/* Status Notification - Floating Box */}
        {showStatusNotification && (
          <div className="status-notification-container">
            <div className="status-notification">
              <h3>Your Application Statuses</h3>
              <div className="status-list">
                {statusList.length > 0 ? (
                  statusList.map((status) => (
                    <div key={`${status.job_id}-${status.last_updated}`} className="status-item">
                      <h4>{status.job_title} at {status.company_name}</h4>
                      <p><strong>Status:</strong> {status.status.replace(/_/g, ' ')}</p>
                      <p><strong>Last Updated:</strong> {new Date(status.last_updated).toLocaleString()}</p>
                      {status.feedback_sent && (
                        <>
                          <p><strong>Feedback Sent:</strong> Yes</p>
                          {status.feedback_sent_at && (
                            <p><strong>Feedback Date:</strong> {new Date(status.feedback_sent_at).toLocaleString()}</p>
                          )}
                          {userData?.email && (
                            <>
                              <p>
                                <a
                                  href="https://mail.google.com/mail/u/0/#inbox"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  📥 Open Gmail Inbox
                                </a>
                              </p>
                              <p style={{ fontStyle: 'italic', color: '#555' }}>
                                Please make sure you're signed in to <strong>{userData.email}</strong> to view your feedback email.
                              </p>
                              <p style={{ fontStyle: 'italic', color: '#555' }}>
                                👉 To see the detailed feedback, please check your email.
                              </p>
                            </>
                          )}
                        </>
                      )}
                      {!status.feedback_sent && (
                        <p><strong>Feedback Sent:</strong> Not yet</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No application statuses found.</p>
                )}
              </div>
              <button 
                className="botn-close" onClick={() => setShowStatusNotification(false)}
                aria-label="Close notification"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="dashboard-content">
          <div className="filters-section">
            <h3 className="filters-title">Apply Filters</h3>
            <div className="filter-controls">
              <div className="filter-group">
                <input
                  type="text"
                  id="jobType"
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                  placeholder="Job Type"
                />
              </div>
              
              <div className="filter-group">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Location"
                />
              </div>
              
              <div className="filter-group">
                <input
                  type="number"
                  id="minSalary"
                  name="minSalary"
                  value={filters.minSalary}
                  onChange={handleFilterChange}
                  placeholder="Min Salary ($)"
                  min="0"
                />
              </div>
              <div className="filter-group">
                <button className="btn btn-reset" onClick={resetFilters}>Reset Filters</button>
              </div>
            </div>
          </div>

          <h2 className="section-title">Available Jobs</h2>
          {loadingJobs ? (
            <div className="loading">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <table className="cand-job-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <React.Fragment key={job.id}>
                      <tr>
                        <td>{job.job_title}</td>
                        <td>{job.company_name}</td>
                        <td>{job.nature_of_role}</td>
                        <td>{job.location}</td>
                        <td>{job.salary}</td>
                        <td>{new Date(job.deadline).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className={`btn ${hasApplied(job.id) ? 'btn-disabled' : 'btn-primary'}`}
                            onClick={() => handleApplyClick(job)}
                            disabled={hasApplied(job.id) || new Date(job.deadline) < new Date()}
                            aria-label={hasApplied(job.id) ? 'Already applied' : 
                                      (new Date(job.deadline) < new Date() ? 'Application closed' : 'Apply for this job')}
                          >
                            {hasApplied(job.id) ? 'Applied' : 
                             (new Date(job.deadline) < new Date() ? 'Expired' : 'Apply')}
                          </button>
                        </td>
                      </tr>
                      {selectedJob && selectedJob.id === job.id && (
                        <tr className="application-form-row">
                          <td colSpan="7">
                            <div className="candidate-application-form">
                              <form className="candidate-form" onSubmit={handleSubmitApplication}>
                                <div className="form-group">
                                  <label>Description:</label>
                                  <p className="description-text">{generateJobDescription(job)}</p>
                                </div>
                                <div className="form-group">
                                  <label>Upload CV:</label>
                                  <div className="file-upload">
                                    <input 
                                      type="file" 
                                      accept=".pdf,.doc,.docx" 
                                      onChange={handleCvUpload} 
                                      required 
                                      disabled={hasApplied(job.id) || isSubmitting}
                                    />
                                    {cvFile && <small>Selected: {cvFile.name}</small>}
                                  </div>
                                </div>
                                <div className="form-actions">
                                  {hasApplied(job.id) ? (
                                    <span className="applied-text">Applied!</span>
                                  ) : (
                                    <>
                                      <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                      >
                                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                      </button>
                                      <button 
                                        type="button" 
                                        className="btn btn-cancel"
                                        onClick={() => setSelectedJob(null)}
                                        disabled={isSubmitting}
                                      >
                                        Cancel
                                      </button>
                                      
                                    </>
                                  )}
                                </div>
                                {isSubmitting && (
                                        <div className="processing-message">
                                          Processing your application...
                                        </div>
                                      )}
                              </form>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr> 
                    <td colSpan="7">
                      <div className="empty-state">
                        No jobs match your filters. Try adjusting your criteria.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    ) : (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    )}
  </div>
);
};

export default CandidateDashboard;