import { type RegisterInfo, RegisterType, type BinaryValue } from "./types"
import { regAliasMap } from "./const"

// Create register information objects
export function createRegisterInfo(binary: string, value: BinaryValue): RegisterInfo {
  const numericIndex = Number.parseInt(binary, 2)
  const name = `x${numericIndex}`
  const alias = regAliasMap[binary] || ""

  // Determine register type based on alias or index
  let type = RegisterType.X
  if (alias.startsWith("s")) {
    type = RegisterType.S
  } else if (alias.startsWith("t")) {
    type = RegisterType.T
  } else if (alias.startsWith("a")) {
    type = RegisterType.A
  }

  return {
    binary,
    name,
    alias,
    type,
    value,
  }
}

// Update the groupRegistersByType function to remove V
export function groupRegistersByType(registers: Record<string, BinaryValue>): Record<RegisterType, RegisterInfo[]> {
  const result: Record<RegisterType, RegisterInfo[]> = {
    [RegisterType.X]: [],
    [RegisterType.S]: [],
    [RegisterType.T]: [],
    [RegisterType.A]: [],
  }

  // Process all registers except PC
  Object.entries(registers)
    .filter(([key]) => key !== "PC")
    .forEach(([binary, value]) => {
      const info = createRegisterInfo(binary, value)
      result[info.type].push(info)
    })

  // Sort registers by numeric index
  Object.values(result).forEach((group) => {
    group.sort((a, b) => Number.parseInt(a.binary, 2) - Number.parseInt(b.binary, 2))
  })

  return result
}

// Update the getTabForRegister function to remove v-registers
export function getTabForRegister(binary: string): string {
  if (binary === "PC") return "x-registers"

  const info = createRegisterInfo(binary, "")

  switch (info.type) {
    case RegisterType.S:
      return "s-registers"
    case RegisterType.T:
      return "t-registers"
    case RegisterType.A:
      return "a-registers"
    default:
      return "x-registers"
  }
}
