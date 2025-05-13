import type { ExecutionResult, BinaryValue, RegisterBinary, MemoryAddress } from "./types"
import { parseInstruction, getBinaryRegister } from "./utils"
import { intructionExecution } from "./ExecutionModule"
import { getTabForRegister } from "./registers"

// Execute a single instruction with detailed tracking of modifications
export function executeInstructionWithTracking(
  instruction: string,
  registers: Record<string, BinaryValue>,
  memory: Record<string, BinaryValue>,
): ExecutionResult {
  try {
    const parsed = parseInstruction(instruction)

    if (parsed.error) {
      return {
        success: false,
        message: `Error: ${parsed.error}`,
      }
    }

    // Make copies to track changes
    const oldRegisters = { ...registers }
    const oldMemory = { ...memory }

    // Execute the instruction
    const result = intructionExecution(parsed.binary_parts, registers, memory)

    if (result) {
      return {
        success: false,
        message: `Error: ${result}`,
      }
    }

    // Track modified registers
    const modifiedRegisters: RegisterBinary[] = []
    Object.keys(registers).forEach((reg) => {
      if (oldRegisters[reg] !== registers[reg]) {
        modifiedRegisters.push(reg)
      }
    })

    // Track modified memory
    const modifiedMemory: MemoryAddress[] = []
    Object.keys(memory).forEach((addr) => {
      if (!oldMemory[addr] || oldMemory[addr] !== memory[addr]) {
        modifiedMemory.push(addr)
      }
    })

    // Generate success message
    let message = `Executed: ${instruction}`
    if (modifiedRegisters.length > 0) {
      const regNames = modifiedRegisters.map((reg) => (reg === "PC" ? "PC" : `${getBinaryRegister(reg)}`)).join(", ")
      message += ` - Modified registers: ${regNames}`
    }

    return {
      success: true,
      modifiedRegisters,
      modifiedMemory,
      message,
    }
  } catch (error) {
    console.error("Error executing instruction:", error)
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

// Determine which tab should be shown based on modifications
export function determineTabToShow(
  modifiedRegisters: RegisterBinary[] = [],
  modifiedMemory: MemoryAddress[] = [],
): string {
  // If memory was modified, show memory or stack tab
  if (modifiedMemory.length > 0) {
    return "stack"
  }

  // If only PC was modified (e.g., by a jump), stay on current tab
  if (modifiedRegisters.length === 1 && modifiedRegisters[0] === "PC") {
    return "" // Empty string means don't change tab
  }

  // If other registers were modified, find the appropriate tab
  const nonPcRegisters = modifiedRegisters.filter((reg) => reg !== "PC")
  if (nonPcRegisters.length > 0) {
    return getTabForRegister(nonPcRegisters[0])
  }

  // Default: don't change tab
  return ""
}
