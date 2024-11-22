import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
// Import necessary chart.js components and register them
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

import SearchForm from './SearchForm';
import TransactionTable from './TransactionTable';
import Statistics from './Statistics';
import './style.css';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch transactions function (inside useEffect)
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/transactions?month=${selectedMonth}&searchQuery=${searchQuery}&page=${currentPage}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();

      setTransactions(data.transactions);
      setStatistics(data.statistics);
      setCategoryData(data.categoryData);
      setBarChartData(data.barChartData);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  // useEffect with dependencies
  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, searchQuery, currentPage]); // Dependency array

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePagination = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    } else if (direction === 'previous' && currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  if (loading) return <div>Loading...</div>; // Show loading message
  if (error) return <div>{error}</div>; // Show error message

  return (
    <div className="dashboard">
      <h1>Transaction Dashboard</h1>
      <SearchForm
        searchQuery={searchQuery}
        selectedMonth={selectedMonth}
        onSearchChange={handleSearchChange}
        onMonthChange={handleMonthChange}
      />
      
      
      <TransactionTable transactions={transactions} />
      
      
      <div className="pagination-btns">
        <span>Page No: {currentPage}</span>
        <button onClick={() => handlePagination('previous')}>Previous</button>
        <button onClick={() => handlePagination('next')}>Next</button>
        <span>Total Pages: {totalPages}</span>
      </div>

      {selectedMonth !== '0' && (
        <>
          <Statistics statistics={statistics} selectedMonth={selectedMonth} />
          <div className="charts">
            <div className="pie-chart">
              <h2>Category Distribution - {selectedMonth}</h2>
              <Pie
                data={{
                  labels: categoryData.map(item => item._id),
                  datasets: [{
                    data: categoryData.map(item => item.itemCount),
                    backgroundColor: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
                  }],
                }}
                options={{ responsive: true }}
              />
            </div>

            <div className="bar-chart">
              <h2>Bar Chart Stats - {selectedMonth}</h2>
              <Bar
                data={{
                  labels: barChartData.map(item => item._id),
                  datasets: [{
                    label: 'Total Sales',
                    data: barChartData.map(item => item.itemCount),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                  }],
                }}
                options={{
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
