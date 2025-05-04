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
  
    const MAX_CYCLES = 1000;
    let cycleCount = 0;
  
    while (pc < hexInstructions.length && cycleCount < MAX_CYCLES) {
      const newPC = executeRISCVInstruction(hexInstructions[pc], newRegisters, newMemory, pc);
      pc = newPC !== undefined ? newPC : pc + 1;
      cycleCount++;
    }
  
    if (cycleCount >= MAX_CYCLES) {
      console.error("❌ Se alcanzó el número máximo de ciclos. Posible bucle infinito.");
      alert("❌ Límite de ciclos alcanzado. Revisa tu código: puede haber un bucle infinito.");
    } else {
      console.log("✅ Simulación completada sin bucles infinitos.");
      alert("✅ Simulación completada");
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
  
    const [highlightRegs, highlightAddrs, newPC] = executeRISCVInstructionWithHighlight(
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

function executeRISCVInstructionWithHighlight(instruction, registers, memory, PC) {
  const trimmed = instruction.trim().split(/[\s,()]+/).filter(Boolean);
  const [op, ...args] = trimmed;

  const getReg = (name) => registers[name] || 0;
  const setReg = (name, value) => { if (name !== "x0") registers[name] = value | 0; };
  const parseImm = (val) => parseInt(val, 10);

  let highlightRegs = [];
  let highlightAddrs = [];

  switch (op) {
    // Tipo R
    case "add":
    case "sub":
    case "sll":
    case "slt":
    case "xor":
    case "srl":
    case "sra":
    case "or":
    case "and": {
      const [rd, rs1, rs2] = args;
      const a = getReg(rs1), b = getReg(rs2);
      const result = {
        add: a + b,
        sub: a - b,
        sll: a << (b & 0x1F),
        slt: a < b ? 1 : 0,
        xor: a ^ b,
        srl: a >>> (b & 0x1F),
        sra: a >> (b & 0x1F),
        or:  a | b,
        and: a & b,
      }[op];
      setReg(rd, result);
      highlightRegs = [rd, rs1, rs2];
      break;
    }

    // Tipo I
    case "addi":
    case "slti":
    case "xori":
    case "ori":
    case "andi":
    case "slli":
    case "srli":
    case "srai": {
      const [rd, rs1, imm] = args;
      const a = getReg(rs1), i = parseImm(imm);
      const result = {
        addi: a + i,
        slti: a < i ? 1 : 0,
        xori: a ^ i,
        ori:  a | i,
        andi: a & i,
        slli: a << (i & 0x1F),
        srli: a >>> (i & 0x1F),
        srai: a >> (i & 0x1F),
      }[op];
      setReg(rd, result);
      highlightRegs = [rd, rs1];
      break;
    }

    case "lb":
    case "lh":
    case "lw":
    case "lbu":
    case "lhu": {
      const [rd, offset, rs1] = args;
      const addr = getReg(rs1) + parseImm(offset);
      let val = memory[addr] || 0;
      if (op === "lb")  val = (val << 24) >> 24;
      if (op === "lh")  val = (val << 16) >> 16;
      if (op === "lbu") val = val & 0xFF;
      if (op === "lhu") val = val & 0xFFFF;
      setReg(rd, val);
      highlightRegs = [rd, rs1];
      highlightAddrs.push(addr);
      break;
    }

    // Tipo S
    case "sb":
    case "sh":
    case "sw": {
      const [rs2, offset, rs1] = args;
      const addr = getReg(rs1) + parseImm(offset);
      const val = getReg(rs2);
      memory[addr] = val & {
        sb: 0xFF,
        sh: 0xFFFF,
        sw: 0xFFFFFFFF
      }[op];
      highlightRegs = [rs1, rs2];
      highlightAddrs.push(addr);
      break;
    }

    // Tipo B
    case "beq":
    case "bne":
    case "blt":
    case "bge":
    case "bltu":
    case "bgeu": {
      const [rs1, rs2, offset] = args;
      const a = getReg(rs1), b = getReg(rs2), i = parseImm(offset);
      const cond = {
        beq: a === b,
        bne: a !== b,
        blt: a < b,
        bge: a >= b,
        bltu: (a >>> 0) < (b >>> 0),
        bgeu: (a >>> 0) >= (b >>> 0),
      }[op];
      highlightRegs = [rs1, rs2];
      if (cond) return [highlightRegs, [], PC + i];
      break;
    }

    // Tipo U
    case "lui": {
      const [rd, imm] = args;
      setReg(rd, parseImm(imm) << 12);
      highlightRegs = [rd];
      break;
    }
    case "auipc": {
      const [rd, imm] = args;
      setReg(rd, PC + (parseImm(imm) << 12));
      highlightRegs = [rd];
      break;
    }

    // Tipo J
    case "jal": {
      const [rd, offset] = args;
      setReg(rd, PC + 1);
      highlightRegs = [rd];
      return [highlightRegs, [], PC + parseImm(offset)];
    }
    case "jalr": {
      const [rd, rs1, imm] = args;
      const target = (getReg(rs1) + parseImm(imm)) & ~1;
      setReg(rd, PC + 1);
      highlightRegs = [rd, rs1];
      return [highlightRegs, [], target];
    }

    case "nop":
      break;

    default:
      console.error("Unsupported instruction:", instruction);
  }
  console.log(`PC ${PC}: ${instruction} , rs1: ${args[1]} = ${getReg(args[1])}, rs2: ${args[2]} = ${getReg(args[2])}`);
  return [highlightRegs, highlightAddrs, PC + 1];
}


function executeRISCVInstruction(instruction, registers, memory, PC) {
  const trimmed = instruction.trim().split(/[\s,()]+/).filter(Boolean);
  const [op, ...args] = trimmed;

  const getReg = (name) => registers[name] || 0;
  const setReg = (name, value) => { if (name !== "x0") registers[name] = value | 0; };
  const parseImm = (val) => parseInt(val, 10);

  console.log(`PC ${PC}: ${instruction}`);

  switch (op) {
    // Tipo R
    case "add":
    case "sub":
    case "sll":
    case "slt":
    case "xor":
    case "srl":
    case "sra":
    case "or":
    case "and": {
      const [rd, rs1, rs2] = args;
      const a = getReg(rs1), b = getReg(rs2);
      const result = {
        add: a + b,
        sub: a - b,
        sll: a << (b & 0x1F),
        slt: a < b ? 1 : 0,
        xor: a ^ b,
        srl: a >>> (b & 0x1F),
        sra: a >> (b & 0x1F),
        or:  a | b,
        and: a & b,
      }[op];
      setReg(rd, result);
      break;
    }

    // Tipo I
    case "addi":
    case "slti":
    case "xori":
    case "ori":
    case "andi":
    case "slli":
    case "srli":
    case "srai": {
      const [rd, rs1, imm] = args;
      const a = getReg(rs1), i = parseImm(imm);
      const result = {
        addi: a + i,
        slti: a < i ? 1 : 0,
        xori: a ^ i,
        ori:  a | i,
        andi: a & i,
        slli: a << (i & 0x1F),
        srli: a >>> (i & 0x1F),
        srai: a >> (i & 0x1F),
      }[op];
      setReg(rd, result);
      break;
    }

    case "lb":
    case "lh":
    case "lw":
    case "lbu":
    case "lhu": {
      const [rd, offset, rs1] = args;
      const addr = getReg(rs1) + parseImm(offset);
      let val = memory[addr] || 0;
      if (op === "lb")  val = (val << 24) >> 24;
      if (op === "lh")  val = (val << 16) >> 16;
      if (op === "lbu") val = val & 0xFF;
      if (op === "lhu") val = val & 0xFFFF;
      setReg(rd, val);
      break;
    }

    // Tipo S
    case "sb":
    case "sh":
    case "sw": {
      const [rs2, offset, rs1] = args;
      const addr = getReg(rs1) + parseImm(offset);
      const val = getReg(rs2);
      memory[addr] = val & {
        sb: 0xFF,
        sh: 0xFFFF,
        sw: 0xFFFFFFFF
      }[op];
      break;
    }

    // Tipo B
    case "beq":
    case "bne":
    case "blt":
    case "bge":
    case "bltu":
    case "bgeu": {
      const [rs1, rs2, offset] = args;
      const a = getReg(rs1), b = getReg(rs2), i = parseImm(offset);
      const cond = {
        beq: a === b,
        bne: a !== b,
        blt: a < b,
        bge: a >= b,
        bltu: (a >>> 0) < (b >>> 0),
        bgeu: (a >>> 0) >= (b >>> 0),
      }[op];
      if (cond) return PC + i;
      break;
    }

    // Tipo U
    case "lui": {
      const [rd, imm] = args;
      setReg(rd, parseImm(imm) << 12);
      break;
    }
    case "auipc": {
      const [rd, imm] = args;
      setReg(rd, PC + (parseImm(imm) << 12));
      break;
    }

    // Tipo J
    case "jal": {
      const [rd, offset] = args;
      setReg(rd, PC + 1);
      return PC + parseImm(offset);
    }
    case "jalr": {
      const [rd, rs1, imm] = args;
      const target = (getReg(rs1) + parseImm(imm)) & ~1;
      setReg(rd, PC + 1);
      return target;
    }

    case "nop":
      break;

    default:
      console.error("Unsupported instruction:", instruction);
  }

  return PC + 1; // avanzar una línea en la lista de instrucciones
}

export default MIPS;
