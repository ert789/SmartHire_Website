import React, { useEffect, useState } from 'react';
import './CandidateDashboard.css';
import Navbar from './NavBar.js';
import './NavBar.css';
import axios from 'axios';

const CandidateDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingUserData, setLoadingUserData] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('User not logged in');
      // Redirect to login page or handle accordingly
      return;
    }

    // Fetch user data
    axios
      .get(`http://127.0.0.1:5000/candidate/${userId}`)
      .then((response) => {
        setUserData(response.data);
        setLoadingUserData(false);
      })
      .catch((error) => {
        console.error(error);
        alert('Failed to fetch user data.');
        setLoadingUserData(false);
      });

    // Fetch jobs and applied jobs
    fetchJobs();
    fetchAppliedJobs(userId);
  }, []);

  const fetchJobs = () => {
    setLoadingJobs(true);
    axios
      .get(`http://127.0.0.1:5000/jobs`)
      .then((response) => {
        setJobs(response.data);
        setLoadingJobs(false);
      })
      .catch((error) => {
        console.error(error);
        alert('Failed to fetch jobs.');
        setLoadingJobs(false);
      });
  };

  const fetchAppliedJobs = (userId) => {
    axios
      .get(`http://127.0.0.1:5000/candidate/applied-jobs/${userId}`)
      .then((response) => {
        setAppliedJobs(response.data);
      })
      .catch((error) => {
        console.error(error);
        alert('Failed to fetch applied jobs.');
      });
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job); // Set the selected job to show in the form
  };

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setCvFile(file); // Save the uploaded file
    } else {
      alert('Please upload a valid file (PDF, DOC, DOCX).');
    }
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');

    if (userId && selectedJob && cvFile) {
      const formData = new FormData();
      formData.append('candidate_id', userId);
      formData.append('job_id', selectedJob.id);
      formData.append('cv', cvFile);

      axios
        .post('http://127.0.0.1:5000/candidate/apply-job', formData)
        .then(() => {
          alert('Successfully applied for the job!');
          fetchAppliedJobs(userId);
          setSelectedJob(null); // Reset the form
          setCvFile(null); // Clear the file input
        })
        .catch((error) => {
          console.error('Error applying for the job:', error.response || error.message);
          alert('Failed to apply for the job. Please try again later.');
        });
    } else {
      alert('Please upload a CV before submitting.');
    }
  };

  const hasApplied = (jobId) => {
    return appliedJobs.some((job) => job.id === jobId);
  };

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
            <h1>Welcome back, {userData.name}</h1>
            <p>{userData.email}</p>
          </div>
  
          <div className="dashboard-content">
            {/* Job Listings */}
            <h2 className="section-title">Available Jobs</h2>
            {loadingJobs ? (
              <div className="loading">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <table className="job-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    
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
                          
                          <td>{job.location}</td>
                          <td>${job.salary}</td>
                          <td>{new Date(job.deadline).toLocaleDateString()}</td>
                          <td>
                           
                              <button 
                                className="btn btn-primary"
                                onClick={() => handleApplyClick(job)}
                              >
                                See Detail
                              </button>
                            
                          </td>
                        </tr>
                        {selectedJob && selectedJob.id === job.id && (
  <tr className="application-form-row">
    <td colSpan="6">
      <div className="application-form">
        <form onSubmit={handleSubmitApplication}>
          <div className="form-group">
            <label>Description:</label>
            <p style={{color: "#061f47"}}>{selectedJob.job_requirements}</p>
          </div> 
          <div className="form-group">
            <label>Upload CV:</label>
            <div className="file-upload">
              <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={handleCvUpload} 
                required 
                disabled={hasApplied(job.id)}
              />
              {cvFile && <small>Selected: {cvFile.name}</small>}
            </div>
          </div>
          <div className="form-actions">
            {hasApplied(job.id) ? (
              <span className="applied-text">Applied!</span>
            ) : (
              <>
                <button type="submit" className="btn btn-primary">
                  Submit Application
                </button>
                <button 
                  type="button" 
                  className="btn btn-cancel"
                  onClick={() => setSelectedJob(null)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </td>
  </tr>
)}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state">
                          No jobs available at the moment.
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
