import React, { useState } from 'react';
import '../styles/Tables.css';

const REGISTERtable = ({ registers, highlightedRegs = [] }) => {
  const groupedRegisters = {};

  // Agrupar registros por su primer carácter
  Object.keys(registers).forEach((reg) => {
    const groupKey = reg[0].toUpperCase();
    if (!groupedRegisters[groupKey]) {
      groupedRegisters[groupKey] = {};
    }
    groupedRegisters[groupKey][reg] = registers[reg];
  });

  const groupKeys = Object.keys(groupedRegisters).sort();
  const [activeTab, setActiveTab] = useState(groupKeys[0] || '');

  return (
    <div id="simulation-tables" className="tables-container">
      <div className="tabs">
        {groupKeys.map((key) => (
          <button
            key={key}
            className={`tab-button ${key === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {key}
          </button>
        ))}
      </div>

      <table id="registerTable" className="REGISTERtable">
        <thead>
          <tr className="values">
            <th>Register</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedRegisters[activeTab] || {}).map(([reg, val]) => (
            <tr key={reg} className={`values ${highlightedRegs.includes(reg) ? 'highlighted' : ''}`}>
              <td>{reg}</td>
              <td>{`0x${val.toString(16).toUpperCase()}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default REGISTERtable;
