// Import from the provided modules
import { regMap, regAliasMap } from "./const"
import { translateRISCV } from "./Compilator"
import { intructionExecution } from "./ExecutionModule"
import { preventDefaults, handleDrop, setIsHighlight } from "./DropFunctions"

export { regMap, regAliasMap, translateRISCV, intructionExecution, preventDefaults, handleDrop, setIsHighlight }

// Add the cn function for classname merging
export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

// Helper function to convert register name to binary
export function getRegisterBinary(register) {
  if (register[0] === "x") {
    const regNum = Number.parseInt(register.replace("x", ""), 10)
    return regNum.toString(2).padStart(5, "0")
  } else if (regMap[register]) {
    return regMap[register]
  }
  return null
}

// Helper function to convert binary to register name
export function getBinaryRegister(binary) {
  for (const [reg, bin] of Object.entries(regMap)) {
    if (bin === binary) {
      return reg
    }
  }
  return `x${Number.parseInt(binary, 2)}`
}

// Helper function to format binary for display
export function formatBinary(binary) {
  if (!binary) return ""
  return binary.match(/.{1,4}/g)?.join(" ") || binary
}

// Helper function to format hex for display
export function formatHex(hex) {
  if (!hex) return ""
  return (
    hex
      .replace(/^0x/, "")
      .match(/.{1,2}/g)
      ?.join(" ") || hex
  )
}

// Initialize registers with zeros
export function initializeRegisters() {
  const registers = {
    PC: "00000000000000000000000000000000",
  }

  // Add all 32 registers with zero values
  for (let i = 0; i < 32; i++) {
    const binary = i.toString(2).padStart(5, "0")
    registers[binary] = "00000000000000000000000000000000"
  }

  return registers
}

// Initialize memory
export function initializeMemory() {
  return {}
}

// Parse RISC-V instruction
export function parseInstruction(instruction) {
  try {
    const result = translateRISCV({ instruction })
    return result
  } catch (error) {
    console.error("Error parsing instruction:", error)
    return { error: "Failed to parse instruction" }
  }
}

// Execute a single instruction
export function executeInstruction(instruction, registers, memory, setRegisters, setMemory, addLogMessage) {
  try {
    const parsed = parseInstruction(instruction)

    if (parsed.error) {
      addLogMessage(`Error: ${parsed.error}`)
      return false
    }

    // Make copies of registers and memory to track changes
    const oldRegisters = { ...registers }

    // Execute the instruction
    const result = intructionExecution(parsed.binary_parts, registers, memory)

    if (result) {
      addLogMessage(`Error: ${result}`)
      return false
    }

    // Log changes to registers
    Object.keys(registers).forEach((reg) => {
      if (oldRegisters[reg] !== registers[reg]) {
        const regName = reg === "PC" ? "PC" : getBinaryRegister(reg)
        const oldValue = Number.parseInt(oldRegisters[reg], 2)
        const newValue = Number.parseInt(registers[reg], 2)
        addLogMessage(`Register ${regName} updated: ${oldValue} -> ${newValue}`)
      }
    })

    // Update state
    setRegisters({ ...registers })
    setMemory({ ...memory })

    return true
  } catch (error) {
    console.error("Error executing instruction:", error)
    addLogMessage(`Error: ${error.message}`)
    return false
  }
}

// Run all instructions
export function runProgram(code, registers, memory, setRegisters, setMemory, addLogMessage) {
  // Filter out empty lines and comments
  const instructions = code
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))

  let success = true

  for (const instruction of instructions) {
    success = executeInstruction(instruction, registers, memory, setRegisters, setMemory, addLogMessage)
    if (!success) break
  }

  return success
}

// Format binary value as decimal
export function binaryToDecimal(binary) {
  if (!binary) return "0"
  // Check if it's a negative number (2's complement)
  if (binary[0] === "1") {
    // Convert to positive and then negate
    const inverted = binary
      .split("")
      .map((bit) => (bit === "0" ? "1" : "0"))
      .join("")
    return (-Number.parseInt(inverted, 2) - 1).toString()
  }
  return Number.parseInt(binary, 2).toString()
}

// Format binary value as hexadecimal
export function binaryToHex(binary) {
  if (!binary) return "0x0"
  return "0x" + Number.parseInt(binary, 2).toString(16).toUpperCase()
}
