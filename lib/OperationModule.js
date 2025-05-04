//AA Y BB deben ser de 32bits
export function isNegBin(bin) {
  if (bin.length !== 32) {
    console.log("La cadena binaria debe tener exactamente 32 bits")
    return
  }
  if (bin[0] == "1") {
    return -1
  } else {
    return 1
  }
}
export function signedExtTo32(bin) {
  // Validar longitud mínima
  if (bin.length < 2) {
    console.log("La cadena binaria debe tener al menos 2 bits")
    return
  }
  const bitSigno = bin[0]
  if (bitSigno === "0") {
    if (bin.length > 32) {
      return bin.slice(-32)
    }
    return bin.padStart(32, "0")
  } else {
    if (bin.length > 32) {
      return bitSigno + bin.slice(1, 32)
    }
    return bitSigno + bin.slice(1).padStart(31, "1")
  }
}
export function intToBin32(num) {
  num = num >>> 0
  let binaryStr = num.toString(2)
  while (binaryStr.length < 32) {
    binaryStr = "0" + binaryStr
  }
  return binaryStr
}
export function binToHex(bin) {
  return Number.parseInt(bin, 2).toString(16).toUpperCase()
}
export function ADD_binToInt(AA, BB) {
  const num1 = Number.parseInt(AA, 2)
  const num2 = Number.parseInt(BB, 2)
  return num1 + num2
}
export function SUB_binToInt(AA, BB) {
  const num1 = Number.parseInt(AA, 2)
  const num2 = Number.parseInt(BB, 2)
  return num1 - num2
}
export function SLT_U_binToInt(AA, BB, isSltu) {
  let bi1 = Number.parseInt(AA, 2)
  let bi2 = Number.parseInt(BB, 2)
  if (!isSltu & (((isNegBin(AA) == 1) & (isNegBin(BB) == -1)) | ((isNegBin(AA) == -1) & (isNegBin(BB) == 1)))) {
    bi1 = bi1 * isNegBin(AA)
    bi2 = bi2 * isNegBin(BB)
  }
  if (bi1 < bi2) {
    return 1
  } else {
    return 0
  }
}
export function AND_bin(AA, BB) {
  const maxLength = Math.max(AA.length, BB.length)
  const str1 = AA.padStart(maxLength, "0")
  const str2 = BB.padStart(maxLength, "0")

  let result = ""
  for (let i = 0; i < maxLength; i++) {
    result += str1[i] === "1" && str2[i] === "1" ? "1" : "0"
  }
  return result
}
export function OR_bin(AA, BB) {
  const maxLength = Math.max(AA.length, BB.length)
  const str1 = AA.padStart(maxLength, "0")
  const str2 = BB.padStart(maxLength, "0")

  let result = ""
  for (let i = 0; i < maxLength; i++) {
    result += str1[i] === "1" || str2[i] === "1" ? "1" : "0"
  }
  return result
}
export function XOR_bin(AA, BB) {
  const maxLength = Math.max(AA.length, BB.length)
  const str1 = AA.padStart(maxLength, "0")
  const str2 = BB.padStart(maxLength, "0")

  let result = ""
  for (let i = 0; i < maxLength; i++) {
    result += str1[i] !== str2[i] ? "1" : "0"
  }
  return result
}
export function SLL_bin(AA, BB) {
  const shiftAmount = Number.parseInt(BB.slice(-5), 2)
  if (shiftAmount === 0) return AA
  const shiftedPart = AA.slice(shiftAmount, 32)
  const result = shiftedPart + "0".repeat(shiftAmount)
  return result.slice(0, 32)
}
export function SR_LA_bin(AA, BB, isArith) {
  const shiftAmount = Number.parseInt(BB.slice(-5), 2)
  if (shiftAmount === 0) return AA

  let shiftedPart
  let result
  if (isArith) {
    const msb = AA[0]
    shiftedPart = AA.slice(1, 32 - shiftAmount)
    result = msb + "0".repeat(shiftAmount) + shiftedPart
  } else {
    shiftedPart = AA.slice(0, 32 - shiftAmount)
    result = "0".repeat(shiftAmount) + shiftedPart
  }
  return result.slice(0, 32)
}
export function valid_dir(dir) {
  const val = Math.abs(Number.parseInt(dir, 2) % 4)
  if (val == 0) {
    return true
  } else {
    return false
  }
}
