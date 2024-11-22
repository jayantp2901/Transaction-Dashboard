import React from 'react';
import './style.css';

const SearchForm = ({ searchQuery, selectedMonth, onSearchChange, onMonthChange }) => {
  return (
    <form className="search-form">
      <div className="btns">
        <input
          type="search"
          name="searchQuery"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search Transaction"
          className="search"
        />
        <select
          name="month"
          value={selectedMonth}
          onChange={onMonthChange}
          id="months"
        >
          <option value="0">Select Month</option>
          {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month, index) => (
            <option key={month} value={month}>{new Date(2024, index).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
      </div>
    </form>
  );
};

export default SearchForm;
