import React from "react";
import "../styles/Debugger.css";

const ControlButtons = ({
  simulateMIPS,
  stepMIPS,
  stepBackMIPS,
  resetMIPS,
}) => {
  return (
    <div id="control-buttons" className="control-buttons">
      <button onClick={resetMIPS} title="Reset">
        <img src="/replay.svg" alt="Reset" />
      </button>
      <button onClick={simulateMIPS} title="Run all">
        <img src="/play.svg" alt="Run" />
      </button>
      <button onClick={stepBackMIPS} title="Step back">
        <img src="/left.svg" alt="Step Back" />
      </button>
      <button onClick={stepMIPS} title="Step forward">
        <img src="/right.svg" alt="Step" />
      </button>
    </div>
  );
};

const DebuggerInfo = ({ PC, instructions = [] }) => {
  return (
    <div id="debugger-info">
      <p><strong>PC:</strong> {PC}</p>
      <p><strong>Current:</strong> {instructions[PC] || '–'}</p>
      <p><strong>Next:</strong> {instructions[PC + 1] || '–'}</p>
    </div>
  );
};

const Debugger = ({
  PC,
  instructions = [],
  simulateMIPS,
  stepMIPS,
  stepBackMIPS,
  resetMIPS
}) => {
  return (
    <div id="debugger" className="Debugger">
      <h2>Debugger</h2>
      <ControlButtons
        simulateMIPS={simulateMIPS}
        stepMIPS={stepMIPS}
        stepBackMIPS={stepBackMIPS}
        resetMIPS={resetMIPS}
      />
      <DebuggerInfo PC={PC} instructions={instructions} />
    </div>
  );
};

export default Debugger;
