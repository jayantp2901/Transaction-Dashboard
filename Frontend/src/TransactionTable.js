import React from 'react';
import './style.css';

const TransactionTable = ({ transactions }) => {
  return (
    <table className='transaction-table'>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Description</th>
          <th>Price</th>
          <th>Category</th>
          <th>Sold</th>
          <th>Images</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(record => (
          <tr key={record.id}>
            <td>{record.id}</td>
            <td>{record.title}</td>
            <td>{record.description}</td>
            <td>{record.price}</td>
            <td>{record.category}</td>
            <td>{record.sold}</td>
            <td><img src={record.image} className="table-img" alt="record-img" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionTable;
