import React from 'react';import './style.css';


const Statistics = ({ statistics, selectedMonth }) => {
  return (
    <div className="statistics">
      <h2 className="stat-month">Statistics - {selectedMonth}</h2>
      <div className="stats">
        <div className="stats-detail">
          <span>Total Sale</span>
          <span className="rightst"><b>{statistics.totalSales?.toFixed(2) || 0}</b></span>
        </div>
        <div className="stats-detail">
          <span>Total sold items</span>
          <span className="rightst"><b>{statistics.totalSoldItems || 0}</b></span>
        </div>
        <div className="stats-detail">
          <span>Total not sold items</span>
          <span className="rightst"><b>{statistics.totalNotSoldItems || 0}</b></span>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
