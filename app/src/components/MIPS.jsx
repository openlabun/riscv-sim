// MIPS.jsx
import React, { useState } from "react";
import Debugger from "./Debugger";
import DropArea from "./Drop";
import "../styles/MIPS.css";
import "../styles/HexSection.css";
import RAMtable from "./RAMtable";
import REGISTERtable from "./REGISTERtable";

const initialRegisters = {
  zero: 0,
  at: 0,
  v0: 0,
  v1: 0,
  a0: 0,
  a1: 0,
  a2: 0,
  a3: 0,
  t0: 0,
  t1: 0,
  t2: 0,
  t3: 0,
  t4: 0,
  t5: 0,
  t6: 0,
  t7: 0,
  s0: 0,
  s1: 0,
  s2: 0,
  s3: 0,
  s4: 0,
  s5: 0,
  s6: 0,
  s7: 0,
  t8: 0,
  t9: 0,
  k0: 0,
  k1: 0,
  gp: 0,
  sp: 0,
  fp: 0,
  ra: 0,
};

const initialMemory = Array.from({ length: 32 }).reduce(
  (acc, curr, i) => ({ ...acc, [i]: 0 }),
  {}
);

const compileMIPS = (assemblyCode) => {
  const lines = assemblyCode.trim().split("\n");
  const compiledLines = lines.map((line) => {
    const trimmed = line.trim();
    const [op, ...operands] = trimmed.split(" ");
    let hex = "";
    switch (op) {
      case "add":
        hex = "0x00000020";
        break;
      case "sub":
        hex = "0x00000022";
        break;
      case "slt":
        hex = "0x0000002A";
        break;
      case "and":
        hex = "0x00000024";
        break;
      case "or":
        hex = "0x00000025";
        break;
      case "addi":
        hex = "0x20000000";
        break;
      case "lw":
        hex = "0x8C000000";
        break;
      case "sw":
        hex = "0xAC000000";
        break;
      case "j":
        hex = "0x08000000";
        break;
      case "beq":
        hex = "0x10000000";
        break;
      case "bne":
        hex = "0x14000000";
        break;
      default:
        hex = "0x00000000";
        break;
    }
    return `${trimmed} // ${hex}`;
  });
  return compiledLines;
};

const MIPS = () => {
  const [mipsInput, setMipsInput] = useState("");
  const [hexInput, setHexInput] = useState("");
  const [registers, setRegisters] = useState(initialRegisters);
  const [memory, setMemory] = useState(initialMemory);
  const [PC, setPC] = useState(0);
  const [history, setHistory] = useState([]);

  // Si existe código compilado se utiliza la parte izquierda de cada línea; de lo contrario se utiliza mipsInput
  const instructions = hexInput
    ? hexInput.split("\n").map((line) => line.split("//")[0].trim())
    : mipsInput.trim().split("\n");
  const currentInstruction = instructions[PC] || "";

  const updateTables = (newRegisters, newMemory) => {
    setRegisters(newRegisters);
    setMemory(newMemory);
  };

  const simulateMIPS = () => {
    document
      .getElementById("simulation-tables")
      .scrollIntoView({ behavior: "smooth" });

    // Se compila el código MIPS y se actualiza el estado hexInput
    const compiledHex = compileMIPS(mipsInput);
    setHexInput(compiledHex.join("\n"));
    // Se extraen las instrucciones (ignorando la parte de comentario)
    const compiledInstructions = compiledHex.map((line) =>
      line.split("//")[0].trim()
    );

    resetMIPS();
    const newRegisters = { ...initialRegisters };
    const newMemory = { ...initialMemory };
    let pc = 0;

    while (pc < compiledInstructions.length) {
      const newPC = executeMIPSInstruction(
        compiledInstructions[pc],
        newRegisters,
        newMemory,
        pc
      );
      if (newPC !== undefined) {
        pc = newPC;
      } else {
        pc += 1;
      }
    }
    updateTables(newRegisters, newMemory);
  };

  const stepMIPS = () => {
    const instructionLines = hexInput
      ? hexInput.split("\n").map((line) => line.split("//")[0].trim())
      : mipsInput.trim().split("\n");
    if (PC >= instructionLines.length) return;
    setHistory([
      ...history,
      { PC, registers: { ...registers }, memory: { ...memory } },
    ]);
    const newRegisters = { ...registers };
    const newMemory = { ...memory };
    const newPC = executeMIPSInstruction(
      instructionLines[PC],
      newRegisters,
      newMemory,
      PC
    );
    if (newPC !== undefined) {
      setPC(newPC);
    } else {
      setPC(PC + 1);
    }
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
  };

  return (
    <div>
      <div className="row-container">
        <DropArea setMipsInput={setMipsInput} setHexInput={setHexInput} />
        <textarea
          id="mips-input"
          className="input-text-area"
          placeholder="Ingrese las instrucciones MIPS aquí..."
          value={mipsInput}
          onChange={(e) => setMipsInput(e.target.value)}
        />
        <button
          id="simulate-mips-button"
          className="btnSimulate"
          onClick={simulateMIPS}
        >
          Simular MIPS
        </button>
      </div>

      <div className="bottom-section">
        <RAMtable memory={memory} />
        <div
          style={{ width: "100%", maxWidth: "444px" }}
          id="simulation-tables"
        >
          <Debugger
            PC={PC}
            simulateMIPS={simulateMIPS}
            mipsInput={mipsInput}
            stepMIPS={stepMIPS}
            stepBackMIPS={stepBackMIPS}
            resetMIPS={resetMIPS}
          />
          {hexInput && (
            <div className="compiled-code">
              <div className="compiled-header">
                <h3>Código Hex compilado</h3>
                <div className="compiled-actions">
                  <button
                    className="copy-button"
                    onClick={() => navigator.clipboard.writeText(hexInput)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copiar
                  </button>
                </div>
              </div>
              <div className="compiled-content">
                {hexInput.split("\n").map((line, index) => {
                  const parts = line.split("//");
                  const hex = parts[1].trim();
                  const instruction = parts[0].trim();

                  return (
                    <div key={index} className="compiled-line">
                      <p>{instruction}</p>
                      <div className="compiled-line-points"></div>
                      <p>{hex}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <REGISTERtable registers={registers} />
      </div>
    </div>
  );
};

/**
 * Función que ejecuta una instrucción MIPS.
 * Se extrae el opcode y los operandos (suponiendo que vienen separados por espacios).
 */
function executeMIPSInstruction(instruction, registers, memory, PC) {
  const parts = instruction.split(" ");
  const op = parts[0];
  const operands = parts.slice(1);
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
        console.error("Dirección de memoria no encontrada:", address);
      }
      break;
    }
    case "sw": {
      const [rt, rs, offset] = operands;
      const address = registers[rs] + parseInt(offset);
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
      console.error("Operación no soportada:", op);
      break;
    }
  }
}

export default MIPS;
