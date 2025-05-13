// Define TypeScript types for the simulator

// Register binary representation
export type RegisterBinary = string

// Memory address binary representation
export type MemoryAddress = string

// Binary value (32-bit)
export type BinaryValue = string

// Register types
export enum RegisterType {
  X = "x", // General purpose
  S = "s", // Saved
  T = "t", // Temporary
  A = "a", // Arguments
}

// Register information
export interface RegisterInfo {
  binary: RegisterBinary
  name: string
  alias: string
  type: RegisterType
  value: BinaryValue
}

// Memory entry
export interface MemoryEntry {
  address: MemoryAddress
  value: BinaryValue
}

// Stack entry
export interface StackEntry {
  address: MemoryAddress
  value: BinaryValue
}

// Display format for register values
export type DisplayFormat = "decimal" | "hex" | "binary"

// Instruction execution result
export interface ExecutionResult {
  success: boolean
  modifiedRegisters?: RegisterBinary[]
  modifiedMemory?: MemoryAddress[]
  message?: string
}

// Tab types
export type TabValue = "x-registers" | "s-registers" | "t-registers" | "a-registers" | "stack" | "log"
