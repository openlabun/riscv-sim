import React from 'react';
import '../styles/Tables.css';

const REGISTERtable = ({ registers = {}, readRegs = [], writeRegs = [] }) => {
  return (
    <div className="tables-container">
      <table id="registerTable" className="REGISTERtable">
        <thead>
          <tr>
            <th>Register</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(registers).map(([reg, val]) => {
            const isRead = readRegs.includes(reg);
            const isWrite = writeRegs.includes(reg);
            const className = isWrite
              ? 'write-row'
              : isRead
              ? 'read-row'
              : '';
            return (
              <tr key={reg} className={className}>
                <td>{reg}</td>
                <td>{`0x${(val||0).toString(16).toUpperCase()}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default REGISTERtable;