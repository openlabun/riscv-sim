import React from 'react';
import '../styles/Tables.css';

const RAMtable = ({ memory = {}, readAddrs = [], writeAddrs = [] }) => {
  return (
    <div className="tables-container">
      <table id="ramTable" className="RAMtable">
        <thead>
          <tr>
            <th>Address</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(memory)
            .filter(([addr]) => parseInt(addr, 10) <= 0xF)
            .map(([addr, val]) => {
              const numAddr = parseInt(addr, 10);
              const isRead = readAddrs.includes(numAddr);
              const isWrite = writeAddrs.includes(numAddr);
              const className = isWrite
                ? 'write-row'
                : isRead
                ? 'read-row'
                : '';
              return (
                <tr key={addr} className={className}>
                  <td>{`0x${numAddr.toString(16).toUpperCase()}`}</td>
                  <td>{`0x${val.toString(16).toUpperCase()}`}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default RAMtable;
