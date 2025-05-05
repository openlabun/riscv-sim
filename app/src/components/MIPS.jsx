import React, { useState } from "react";
import Debugger from "./Debugger";
import DropArea from "./Drop";
import "../styles/MIPS.css";
import "../styles/HexSection.css";
import RAMtable from "./RAMtable";
import REGISTERtable from "./REGISTERtable";

const mipsAlias = [
  "zero",
  "at",
  "v0",
  "v1",
  "a0",
  "a1",
  "a2",
  "a3",
  "t0",
  "t1",
  "t2",
  "t3",
  "t4",
  "t5",
  "t6",
  "t7",
  "s0",
  "s1",
  "s2",
  "s3",
  "s4",
  "s5",
  "s6",
  "s7",
  "t8",
  "t9",
  "k0",
  "k1",
  "gp",
  "sp",
  "fp",
  "ra",
];
const initialRegisters = Object.fromEntries(mipsAlias.map((n) => [n, 0]));
const initialMemory = {}; // sparse byte store

const regIndex = Object.fromEntries(mipsAlias.map((n, i) => [n, i]));
for (let i = 0; i < 32; i++) regIndex[`x${i}`] = i;
const rvToMips = {
  0: "zero",
  1: "ra",
  2: "sp",
  3: "gp",
  4: "tp",
  5: "t0",
  6: "t1",
  7: "t2",
  8: "s0",
  9: "s1",
  10: "a0",
  11: "a1",
  12: "a2",
  13: "a3",
  14: "a4",
  15: "a5",
  16: "a6",
  17: "a7",
  18: "s2",
  19: "s3",
  20: "s4",
  21: "s5",
  22: "s6",
  23: "s7",
  24: "t8",
  25: "t9",
  26: "k0",
  27: "k1",
  28: "gp",
  29: "sp",
  30: "fp",
  31: "ra",
};
const norm = (r) => {
  r = r.replace(/^\$/, "");
  const m = r.match(/^x(\d+)$/i);
  return m ? rvToMips[+m[1]] : r.toLowerCase();
};

function exec(line, R, M, pc) {
  const t = line.trim().replace(/[,()]/g, " ").split(/\s+/).filter(Boolean);
  if (!t.length)
    return { next: pc + 1, read: [], write: [], mRead: [], mWrite: [] };
  const op = t[0].toLowerCase();
  const a = t.slice(1).map(norm);
  const read = [],
    write = [],
    mRead = [],
    mWrite = [];
  const g = (r) => R[r] ?? 0;
  const s = (r, v) => {
    R[r] = v >>> 0;
  };
  const mk = (r, t) => (t === "r" ? read.push(r) : write.push(r));
  let next;
  switch (op) {
    case "addi": {
      const [d, r, i] = a;
      mk(r, "r");
      mk(d, "w");
      s(d, g(r) + Number(i));
      break;
    }
    case "add":
    case "sub":
    case "and":
    case "or":
    case "slt": {
      const [d, r1, r2] = a;
      mk(r1, "r");
      mk(r2, "r");
      mk(d, "w");
      const A = g(r1),
        B = g(r2);
      s(
        d,
        op === "add"
          ? A + B
          : op === "sub"
          ? A - B
          : op === "and"
          ? A & B
          : op === "or"
          ? A | B
          : A < B
          ? 1
          : 0
      );
      break;
    }
    case "lb": {
      const [d, o, b] = a;
      mk(b, "r");
      mk(d, "w");
      const addr = g(b) + Number(o);
      mRead.push(addr);
      const byte = (M[addr] ?? 0) & 0xff;
      s(d, byte & 0x80 ? byte | 0xffffff00 : byte);
      break;
    }
    case "sb": {
      const [r, o, b] = a;
      mk(b, "r");
      mk(r, "r");
      const addr = g(b) + Number(o);
      mWrite.push(addr);
      M[addr] = g(r) & 0xff;
      break;
    }
    case "beq":
    case "bne": {
      const [r1, r2, off] = a;
      mk(r1, "r");
      mk(r2, "r");
      const cond = op === "beq" ? g(r1) === g(r2) : g(r1) !== g(r2);
      if (cond) next = pc + Number(off);
      break;
    }
    case "j":
      next = Number(a[0]);
      break;
  }
  return { next: next ?? pc + 1, read, write, mRead, mWrite };
}

const CodeEditor = ({ code, onChange, hl }) => (
  <div className="editor-wrapper" style={{ display: "flex", gap: "16px" }}>
    <textarea
      className="input-text-area overlay"
      value={code}
      onChange={(e) => onChange(e.target.value)}
    />
    <pre className="highlight-layer" >
      {code.split("\n").map((l, i) => (
        <div
          key={i}
          className={
            i === hl ? "line current" : i === hl + 1 ? "line next" : "line"
          }
          style={{textAlign: "left"}}
        >
          {l.toLowerCase() || " "}
        </div>
      ))}
    </pre>
  </div>
);

export default function MIPS() {
  const [src, setSrc] = useState("");
  const [pc, setPC] = useState(0);
  const [hl, setHL] = useState(-1);

  const [R, setR] = useState({ ...initialRegisters });
  const [M, setM] = useState({ ...initialMemory });

  const [reads, setReads] = useState([]);
  const [writes, setWrites] = useState([]);
  const [mReads, setMReads] = useState([]);
  const [mWrites, setMWrites] = useState([]);

  const [hist, setHist] = useState([]);

  const reset = () => {
    setR({ ...initialRegisters });
    setM({ ...initialMemory });
    setPC(0);
    setHL(-1);
    setReads([]);
    setWrites([]);
    setMReads([]);
    setMWrites([]);
    setHist([]);
  };

  const step = () => {
    const lines = src.split("\n");
    if (pc >= lines.length) return;

    const newR = { ...R };
    const newM = { ...M };
    const { next, read, write, mRead, mWrite } = exec(
      lines[pc],
      newR,
      newM,
      pc
    );

    setHist((h) => [
      ...h,
      {
        pc: next,
        hl: pc,
        R: newR,
        M: newM,
        reads: read,
        writes: write,
        mReads: mRead,
        mWrites: mWrite,
      },
    ]);

    setR(newR);
    setM(newM);
    setReads(read);
    setWrites(write);
    setMReads(mRead);
    setMWrites(mWrite);
    setHL(pc);
    setPC(next);
  };

  const back = () => {
    setHist((h) => {
      if (!h.length) return h;
      const last = h[h.length - 1];
      setR(last.R);
      setM(last.M);
      setPC(last.pc);
      setHL(last.hl);
      setReads(last.reads);
      setWrites(last.writes);
      setMReads(last.mReads);
      setMWrites(last.mWrites);
      return h.slice(0, -1);
    });
  };

  return (
    <div>
      <div className="row-container">
        <DropArea setMipsInput={setSrc} setHexInput={() => {}} />
        <CodeEditor code={src} onChange={setSrc} hl={hl} />
      </div>

      <div className="bottom-section">
        <RAMtable memory={M} readAddrs={mReads} writeAddrs={mWrites} />
        <Debugger
          PC={hl}
          instructions={src.split("\n")}
          stepMIPS={step}
          stepBackMIPS={back}
          resetMIPS={reset}
        />
        <REGISTERtable registers={R} readRegs={reads} writeRegs={writes} />
      </div>
    </div>
  );
}
