import React from 'react';
import '../styles/Tables.css';

const RAMtable = ({ memory, highlightedAddrs = [] }) => {
  const highlightSet = new Set(highlightedAddrs.map(Number));
  return (
    <div id="simulation-tables" className='tables-container'>
      <div className="tabs invisible">
        <button className='tab-button active'>A</button>
      </div>
      <table id="ramTable" className='RAMtable' >
        <thead>
          <tr className='values'>
            <th>Address</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(memory).map(([address, value]) => {
            const numericAddr = parseInt(address, 10);
            const isHighlighted = highlightedAddrs.includes(numericAddr);

            return (
              <tr
                key={address}
                className={`values ${isHighlighted ? 'highlighted' : ''}`}
              >
                <td>{address}</td>
                <td>{`0x${value.toString(16).toUpperCase()}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RAMtable;
