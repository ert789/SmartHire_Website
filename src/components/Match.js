import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import './MatchVisualization.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const MatchVisualization = ({ matchData }) => {
  if (!matchData) return <div>Loading match data...</div>;

  const radarData = {
    labels: Object.keys(matchData.category_scores),
    datasets: [
      {
        label: 'Match Percentage',
        data: Object.values(matchData.category_scores),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="match-visualization">
      <h3>Candidate-Job Match Analysis</h3>
      <div className="overall-score">
        <h4>Overall Match Score: {matchData.final_match_score}%</h4>
      </div>
      <div className="chart-container">
        <Radar data={radarData} />
      </div>
      <div className="skills-comparison">
        <h4>Skills Comparison</h4>
        <div className="skills-lists">
          <div>
            <h5>Candidate Skills</h5>
            <ul>
              {matchData.cv_skills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Job Required Skills</h5>
            <ul>
              {matchData.job_skills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchVisualization;