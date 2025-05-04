import React, { useState } from "react";
import Debugger from "./Debugger";
import DropArea from "./Drop";
import "../styles/MIPS.css";
import RAMtable from "./RAMtable";
import REGISTERtable from "./REGISTERtable";
import CircuitImage from './Circuit';

const initialRegisters = {
  zero: 0, at: 0, v0: 0, v1: 0,
  a0: 0, a1: 0, a2: 0, a3: 0,
  t0: 0, t1: 0, t2: 0, t3: 0,
  t4: 0, t5: 0, t6: 0, t7: 0,
  s0: 0, s1: 0, s2: 0, s3: 0,
  s4: 0, s5: 0, s6: 0, s7: 0,
  t8: 0, t9: 0, k0: 0, k1: 0,
  gp: 0, sp: 0, fp: 0, ra: 0,
};

const initialMemory = Array.from({ length: 32 }).reduce(
  (acc, curr, i) => ({ ...acc, [i]: 0 }),
  {}
);

const MIPS = () => {
  const [mipsInput, setMipsInput] = useState("");
  const [hexInput, setHexInput] = useState("");
  const [registers, setRegisters] = useState(initialRegisters);
  const [memory, setMemory] = useState(initialMemory);
  const [PC, setPC] = useState(0);
  const [history, setHistory] = useState([]);
  const [highlightedRegs, setHighlightedRegs] = useState([]);
  const [highlightedAddrs, setHighlightedAddrs] = useState([]);
  const instructions = mipsInput.trim().split("\n");
  const currentInstruction = instructions[PC] || '';

  const updateTables = (newRegisters, newMemory) => {
    setRegisters(newRegisters);
    setMemory(newMemory);
  };

  const simulateMIPS = () => {
    document
      .getElementById("simulation-tables")
      .scrollIntoView({ behavior: "smooth" });

    const hexInstructions = mipsInput.trim().split("\n");
    resetMIPS();

    const newRegisters = { ...initialRegisters };
    const newMemory = { ...initialMemory };
    let pc = 0;

    while (pc < hexInstructions.length) {
      const newPC = executeMIPSInstruction(hexInstructions[pc], newRegisters, newMemory, pc);
      if (newPC !== undefined) {
        pc = newPC;
      } else {
        pc += 1;
      }
    }

  updateTables(newRegisters, newMemory);
  };
  const stepMIPS = () => {
    const instructions = mipsInput.trim().split("\n");
    if (PC >= instructions.length) return;
  
    setHistory([
      ...history,
      { PC, registers: { ...registers }, memory: { ...memory } },
    ]);
  
    const newRegisters = { ...registers };
    const newMemory = { ...memory };
    const currentInst = instructions[PC];
  
    const [highlightRegs, highlightAddrs, newPC] = executeMIPSInstructionWithHighlight(
      currentInst, newRegisters, newMemory, PC
    );
  
    setHighlightedRegs(highlightRegs);
    setHighlightedAddrs(highlightAddrs);
  
    setPC(newPC !== undefined ? newPC : PC + 1);
    updateTables(newRegisters, newMemory);
  };
  
  const stepBackMIPS = () => {
    if (PC === 0) return;

    const lastHistoryIndex = history.length - 1;
    const lastState = history[lastHistoryIndex];

    if (lastState) {
      setPC(lastState.PC);
      setRegisters(lastState.registers);
      setMemory(lastState.memory);
      setHistory(history.slice(0, lastHistoryIndex));
    }
  };

  const resetMIPS = () => {
    setPC(0);
    setHistory([]);
    setRegisters(initialRegisters);
    setMemory(initialMemory);
    setHighlightedAddrs([]);
    setHighlightedRegs([]);
  };

  return (
    <div className="mips-container">
      <div className="row-container">
        <DropArea setMipsInput={setMipsInput} setHexInput={setHexInput} />
        <textarea
          id="mips-input"
          className="input-text-area"
          placeholder="Enter MIPS instructions here..."
          value={mipsInput}
          onChange={(e) => setMipsInput(e.target.value)}
        />
        <button
          id="simulate-mips-button"
          className="btnSimulate"
          onClick={simulateMIPS}
        >
          Simulate MIPS
        </button>
      </div>
      <div className="bottom-section">
        <RAMtable memory={memory} highlightedAddrs={highlightedAddrs} />
        <Debugger
          PC={PC}
          simulateMIPS={simulateMIPS}
          mipsInput={mipsInput}
          stepMIPS={stepMIPS}
          stepBackMIPS={stepBackMIPS}
          resetMIPS={resetMIPS}
        />
        <REGISTERtable registers={registers} highlightedRegs={highlightedRegs} />
      </div>
    </div>
  );
};

function executeMIPSInstructionWithHighlight(instruction, registers, memory, PC) {
  const [op, ...operands] = instruction.split(" ");
  let highlightRegs = [];
  let highlightAddrs = [];

  switch (op) {
    case "add":
    case "sub":
    case "slt":
    case "and":
    case "or": {
      const [rd, rs, rt] = operands;
      registers[rd] = op === "add" ? registers[rs] + registers[rt]
                    : op === "sub" ? registers[rs] - registers[rt]
                    : op === "slt" ? (registers[rs] < registers[rt] ? 1 : 0)
                    : op === "and" ? (registers[rs] & registers[rt])
                    : registers[rs] | registers[rt];
      highlightRegs = [rd, rs, rt];
      break;
    }
    case "addi": {
      const [rd, rs, immediate] = operands;
      registers[rd] = registers[rs] + parseInt(immediate);
      highlightRegs = [rd, rs];
      break;
    }
    case "lw": {
      const [rt, rs, offset] = operands;
      const addr = registers[rs] + parseInt(offset);
      if (memory.hasOwnProperty(addr)) {
        registers[rt] = memory[addr];
        highlightAddrs.push(addr);
        highlightRegs = [rt, rs];
      }
      break;
    }
    case "sw": {
      const [rt, rs, offset] = operands;
      const addr = registers[rs] + parseInt(offset);
      memory[addr] = registers[rt];
      highlightAddrs.push(addr);
      highlightRegs = [rt, rs];
      break;
    }
    case "j": {
      return [[], [], parseInt(operands[0])];
    }
    case "beq":
    case "bne": {
      const [rs, rt, offset] = operands;
      const condition = op === "beq" ? registers[rs] === registers[rt] : registers[rs] !== registers[rt];
      highlightRegs = [rs, rt];
      if (condition) return [highlightRegs, [], PC + parseInt(offset)];
      break;
    }
    default:
      break;
  }

  return [highlightRegs, highlightAddrs];
}

function executeMIPSInstruction(instruction, registers, memory, PC) {
  // Split MIPS instruction into operation and operands
  const [op, ...operands] = instruction.split(" ");
  console.log("Executing instruction:", instruction);
  console.log("Operands:", operands);
  console.log("Op", op);
  // Implement execution logic for each MIPS operation
  switch (op) {
    case "add": {
      const [rd, rs, rt] = operands;
      registers[rd] = registers[rs] + registers[rt];
      break;
    }
    case "sub": {
      const [rd, rs, rt] = operands;
      registers[rd] = registers[rs] - registers[rt];
      break;
    }
    case "slt": {
      const [rd, rs, rt] = operands;
      registers[rd] = registers[rs] < registers[rt] ? 1 : 0;
      break;
    }
    case "and": {
      const [rd, rs, rt] = operands;
      registers[rd] = registers[rs] & registers[rt];
      break;
    }
    case "or": {
      const [rd, rs, rt] = operands;
      registers[rd] = registers[rs] | registers[rt];
      break;
    }
    case "addi": {
      const [rd, rs, immediate] = operands;
      registers[rd] = registers[rs] + parseInt(immediate);
      break;
    }
    case "lw": {
      const [rt, rs, offset] = operands;
      const address = registers[rs] + parseInt(offset);
      if (memory.hasOwnProperty(address)) {
        registers[rt] = memory[address];
      } else {
        console.error("Memory address not found:", address);
      }
      break;
    }
    case "sw": {
      const [rt, rs, offset] = operands;
      const address = registers[rs] + parseInt(offset);
      console.log(memory);
      memory[address] = registers[rt];
      break;
    }
    case "j": {
      const [address] = operands;
      return parseInt(address); 
    }
    case "beq": {
      const [rs, rt, offset] = operands;
      if (registers[rs] === registers[rt]) {
        return PC + parseInt(offset);
      }
      break;
    }
    case "bne": {
      const [rs, rt, offset] = operands;
      if (registers[rs] !== registers[rt]) {
        return PC + parseInt(offset); 
      }
      break;
    }
    default: {
      console.error("Unsupported operation:", op);
      break;
    }
  }
}

export default MIPS;
