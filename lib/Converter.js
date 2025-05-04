// --- Utils ---
export function binaryToHex(binaryString) {
  while (binaryString.length % 4 !== 0) {
    binaryString = "0" + binaryString
  }

  let hexString = ""
  for (let i = 0; i < binaryString.length; i += 4) {
    const binaryChunk = binaryString.substr(i, 4)
    const hexDigit = Number.parseInt(binaryChunk, 2).toString(16)
    hexString += hexDigit
  }

  return "0x" + hexString.toUpperCase()
}

export function hexToBinary(hex) {
  let binary = ""
  for (let i = 0; i < hex.length; i++) {
    const bin = Number.parseInt(hex[i], 16).toString(2)
    binary += bin.padStart(4, "0")
  }
  return binary
}

export function sum(a, b) {
  return a + b
}

const regMap = {
  zero: "00000",
  ra: "00001",
  sp: "00010",
  gp: "00011",
  tp: "00100",
  t0: "00101",
  t1: "00110",
  t2: "00111",
  s0: "01000",
  s1: "01001",
  a0: "01010",
  a1: "01011",
  a2: "01100",
  a3: "01101",
  a4: "01110",
  a5: "01111",
  a6: "10000",
  a7: "10001",
  s2: "10010",
  s3: "10011",
  s4: "10100",
  s5: "10101",
  s6: "10110",
  s7: "10111",
  s8: "11000",
  s9: "11001",
  s10: "11010",
  s11: "11011",
  t3: "11100",
  t4: "11101",
  t5: "11110",
  t6: "11111",
}

const opcodeMap = {
  // U-type instructions
  lui: { opcode: "0110111", type: "U" },
  auipc: { opcode: "0010111", type: "U" },
  // J-type instructions
  jal: { opcode: "1101111", type: "J" },
  // B-type instructions
  beq: { opcode: "1100011", funct3: "000", type: "B" },
  bne: { opcode: "1100011", funct3: "001", type: "B" },
  blt: { opcode: "1100011", funct3: "100", type: "B" },
  bge: { opcode: "1100011", funct3: "101", type: "B" },
  bltu: { opcode: "1100011", funct3: "110", type: "B" },
  bgeu: { opcode: "1100011", funct3: "111", type: "B" },
  // I-type instructions example: lw x1, 0(x2) = lw x1, 0, x2
  jalr: { opcode: "1100111", funct3: "000", type: "I" },
  lb: { opcode: "0000011", funct3: "000", type: "I" },
  lh: { opcode: "0000011", funct3: "001", type: "I" },
  lw: { opcode: "0000011", funct3: "010", type: "I" },
  lbu: { opcode: "0000011", funct3: "100", type: "I" },
  lhu: { opcode: "0000011", funct3: "101", type: "I" },
  // S-type instructions
  sb: { opcode: "0100011", funct3: "000", type: "S" },
  sh: { opcode: "0100011", funct3: "001", type: "S" },
  sw: { opcode: "0100011", funct3: "010", type: "S" },
  // I type arithmetic instructions
  addi: { opcode: "0010011", funct3: "000", type: "I" },
  slti: { opcode: "0010011", funct3: "010", type: "I" },
  sltiu: { opcode: "0010011", funct3: "011", type: "I" },
  xori: { opcode: "0010011", funct3: "100", type: "I" },
  ori: { opcode: "0010011", funct3: "110", type: "I" },
  andi: { opcode: "0010011", funct3: "111", type: "I" },
  slli: { opcode: "0010011", funct3: "001", funct7: "0000000", type: "I" },
  srli: { opcode: "0010011", funct3: "101", funct7: "0000000", type: "I" },
  srai: { opcode: "0010011", funct3: "101", funct7: "0100000", type: "I" },
  // R-type arithmetic instructions
  add: { opcode: "0110011", funct3: "000", funct7: "0000000", type: "R" },
  sub: { opcode: "0110011", funct3: "000", funct7: "0100000", type: "R" },
  sll: { opcode: "0110011", funct3: "001", funct7: "0000000", type: "R" },
  slt: { opcode: "0110011", funct3: "010", funct7: "0000000", type: "R" },
  sltu: { opcode: "0110011", funct3: "011", funct7: "0000000", type: "R" },
  xor: { opcode: "0110011", funct3: "100", funct7: "0000000", type: "R" },
  srl: { opcode: "0110011", funct3: "101", funct7: "0000000", type: "R" },
  sra: { opcode: "0110011", funct3: "101", funct7: "0100000", type: "R" },
  or: { opcode: "0110011", funct3: "110", funct7: "0000000", type: "R" },
  and: { opcode: "0110011", funct3: "111", funct7: "0000000", type: "R" },
}

// Function to translate an instruction to its binary representation
// and then to hexadecimal format
export function translateInstructionToHex(instruction) {
  // format alternative for I and S type instructions (e.g., lw x3, 3(x4))
  let processedInstruction = instruction
  const parenthesisMatch = instruction.match(/(\w+)\s+(\w+),\s*(-?\d+)$$(\w+)$$/)

  if (parenthesisMatch) {
    const [_, mnemonic, rd, offset, rs] = parenthesisMatch
    processedInstruction = `${mnemonic} ${rd}, ${offset}, ${rs}`
    instruction = processedInstruction
  }
  const parts = instruction.trim().split(/\s+|,/).filter(Boolean)
  const mnemonic = parts[0]
  const mapping = opcodeMap[mnemonic]
  if (!mapping) {
    return "Unknown Instruction", mnemonic
  }

  let binary = ""

  switch (mapping.type) {
    case "R":
      const rd_r = getRegisterBinary(parts[1])
      const rs1_r = getRegisterBinary(parts[2])
      const rs2_r = getRegisterBinary(parts[3])
      binary = `${mapping.funct7}${rs2_r}${rs1_r}${mapping.funct3}${rd_r}${mapping.opcode}`
      break
    case "I":
      const rd_i = getRegisterBinary(parts[1])
      const imm_i = getImmediateBinary(parts[2], 12)
      const rs1_i = getRegisterBinary(parts[3])
      binary = `${imm_i}${rs1_i}${mapping.funct3}${rd_i}${mapping.opcode}`
      break
    case "S":
      const rs2_s = getRegisterBinary(parts[1])
      const offset_s = getImmediateBinary(parts[2], 12)
      const rs1_s = getRegisterBinary(parts[3])
      const imm11_5 = offset_s.substring(0, 7)
      const imm4_0 = offset_s.substring(7)
      binary = `${imm11_5}${rs2_s}${rs1_s}${mapping.funct3}${imm4_0}${mapping.opcode}`
      break
    case "B":
      const rs1_b = getRegisterBinary(parts[1])
      const rs2_b = getRegisterBinary(parts[2])
      const offset_b = getImmediateBinary(parts[3], 13) // 12 bits + signo
      binary = `${offset_b[0]}${offset_b.slice(2, 8)}${rs2_b}${rs1_b}${mapping.funct3}${offset_b.slice(8, 12)}${offset_b[1]}${mapping.opcode}`
      break
    case "U":
      const rd_u = getRegisterBinary(parts[1])
      const imm_u = getImmediateBinary(parts[2], 20)
      binary = `${imm_u}${rd_u}${mapping.opcode}`
      break
    case "J":
      const rd_j = getRegisterBinary(parts[1])
      const offset_j = getImmediateBinary(parts[2], 21) // 20 bits + signo
      binary = `${offset_j[0]}${offset_j.slice(10, 20)}${offset_j[9]}${offset_j.slice(1, 9)}${rd_j}${mapping.opcode}`
      break
    default:
      return "Unknown Instruction Type"
  }

  return binary
}

// Funciones auxiliares para registros e inmediatos
function getRegisterBinary(register) {
  if (register[0] === "x") {
    const regNum = Number.parseInt(register.replace("x", ""), 10)
    return regNum.toString(2).padStart(5, "0")
  } else if (regMap[register]) {
    return regMap[register]
  }
}

function getImmediateBinary(value, bits) {
  const num = Number.parseInt(value, 10)
  if (num < 0) {
    return (num >>> 0).toString(2).slice(-bits)
  }
  return num.toString(2).padStart(bits, "0")
}

const regMaph = {
  "00000": "zero",
  "00001": "ra",
  "00010": "sp",
  "00011": "gp",
  "00100": "tp",
  "00101": "t0",
  "00110": "t1",
  "00111": "t2",
  "01000": "s0",
  "01001": "s1",
  "01010": "a0",
  "01011": "a1",
  "01100": "a2",
  "01101": "a3",
  "01110": "a4",
  "01111": "a5",
  10000: "a6",
  10001: "a7",
  10010: "s2",
  10011: "s3",
  10100: "s4",
  10101: "s5",
  10110: "s6",
  10111: "s7",
  11000: "s8",
  11001: "s9",
  11010: "s10",
  11011: "s11",
  11100: "t3",
  11101: "t4",
  11110: "t5",
  11111: "t6",
}

export function translateHexToInstruction(hex) {
  const binary = hexToBinary(hex).padStart(32, "0")
  const opcode = binary.slice(25, 32)

  for (const [mnemonic, mapping] of Object.entries(opcodeMap)) {
    if (mapping.opcode === opcode) {
      switch (mapping.type) {
        case "R":
          const funct3_r = binary.slice(17, 20)
          const funct7_r = binary.slice(0, 7)
          if (mapping.funct3 === funct3_r && mapping.funct7 === funct7_r) {
            const rd_r = regMaph[binary.slice(20, 25)]
            const rs1_r = regMaph[binary.slice(12, 17)]
            const rs2_r = regMaph[binary.slice(7, 12)]
            return `${mnemonic} ${rd_r}, ${rs1_r}, ${rs2_r}`
          }
          break
        case "I":
          const funct3_i = binary.slice(17, 20)
          if (mapping.funct3 === funct3_i) {
            const rd_i = regMaph[binary.slice(20, 25)]
            const rs1_i = regMaph[binary.slice(12, 17)]
            const imm_i = (Number.parseInt(binary.slice(0, 12), 2) << 20) >> 20 // Sign-extend
            return `${mnemonic} ${rd_i}, ${rs1_i}, ${imm_i}`
          }
          break
        case "S":
          const funct3_s = binary.slice(17, 20)
          if (mapping.funct3 === funct3_s) {
            const imm4_0 = binary.slice(20, 25)
            const imm11_5 = binary.slice(0, 7)
            const rs1_s = regMaph[binary.slice(12, 17)]
            const rs2_s = regMaph[binary.slice(7, 12)]
            const imm_s = (Number.parseInt(imm11_5 + imm4_0, 2) << 20) >> 20 // Sign-extend
            return `${mnemonic} ${rs2_s}, ${imm_s}(${rs1_s})`
          }
          break
        case "B":
          const funct3_b = binary.slice(17, 20)
          if (mapping.funct3 === funct3_b) {
            const imm12 = binary[0]
            const imm10_5 = binary.slice(1, 7)
            const imm4_1 = binary.slice(20, 24)
            const imm11 = binary[24]
            const rs1_b = regMaph[binary.slice(12, 17)]
            const rs2_b = regMaph[binary.slice(7, 12)]
            const imm_b = (Number.parseInt(imm12 + imm11 + imm10_5 + imm4_1 + "0", 2) << 19) >> 19 // Sign-extend
            return `${mnemonic} ${rs1_b}, ${rs2_b}, ${imm_b}`
          }
          break
        case "U":
          const rd_u = regMaph[binary.slice(20, 25)]
          const imm_u = Number.parseInt(binary.slice(0, 20), 2)
          return `${mnemonic} ${rd_u}, ${imm_u}`
        case "J":
          const rd_j = regMaph[binary.slice(20, 25)]
          const imm20 = binary[0]
          const imm10_1 = binary.slice(1, 11)
          const imm11_j = binary[11]
          const imm19_12 = binary.slice(12, 20)
          const imm_j = (Number.parseInt(imm20 + imm19_12 + imm11_j + imm10_1 + "0", 2) << 11) >> 11 // Sign-extend
          return `${mnemonic} ${rd_j}, ${imm_j}`
        default:
          return "Unknown Instruction Type"
      }
    }
  }
  return "Unknown Instruction"
}

export function translateInstructionToRV32I(instruction) {
  // This is a placeholder function for the file drop functionality
  // In a real implementation, this would convert from another format to RISC-V
  return instruction
}
