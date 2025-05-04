export function binaryToHex(binaryString) {
    // Pad the binary string with leading zeros to ensure it's a multiple of 4
    while (binaryString.length % 4 !== 0) {
        binaryString = '0' + binaryString;
    }

    // Initialize an empty string to store the hexadecimal representation
    let hexString = '';

    // Convert each group of 4 bits to its hexadecimal equivalent
    for (let i = 0; i < binaryString.length; i += 4) {
        const binaryChunk = binaryString.substr(i, 4); // Get a chunk of 4 bits
        const hexDigit = parseInt(binaryChunk, 2).toString(16); // Convert the chunk to hexadecimal
        hexString += hexDigit; // Append the hexadecimal digit to the result
    }

    // Return the hexadecimal representation
    return "0x" + hexString.toUpperCase(); // Convert to uppercase for consistency
}

export function sum(a, b) {
    return a + b;
}


export function translateInstructionToHex(instruction) {
    const opcodeMap = {
        "add": "000000",
        "sub": "000000",
        "slt": "000000",
        "and": "000000",
        "or": "000000",
        "addi": "001000",
        "lw": "100011",
        "sw": "101011",
        "beq": "000100",
        "bne": "000101",
        "j": "000010"
    };

    const funcMap = {
        "add": "100000",
        "sub": "100010",
        "slt": "101010",
        "and": "100100",
        "or": "100101",
    };

    const regMap = {
        "zero": "00000",
        "at": "00001",
        "v0": "00010",
        "v1": "00011",
        "a0": "00100",
        "a1": "00101",
        "a2": "00110",
        "a3": "00111",
        "t0": "01000",
        "t1": "01001",
        "t2": "01010",
        "t3": "01011",
        "t4": "01100",
        "t5": "01101",
        "t6": "01110",
        "t7": "01111",
        "s0": "10000",
        "s1": "10001",
        "s2": "10010",
        "s3": "10011",
        "s4": "10100",
        "s5": "10101",
        "s6": "10110",
        "s7": "10111",
        "t8": "11000",
        "t9": "11001",
        "k0": "11010",
        "k1": "11011",
        "gp": "11100",
        "sp": "11101",
        "fp": "11110",
        "ra": "11111"
    };

    const parts = instruction.split(' ');

    const opcode = opcodeMap[parts[0]];
    if (!opcode) return "Unknown Instruction";

    let binaryInstruction = opcode;
    console.log(parts[0]);
    if (["add", "sub", "slt", "and", "or"].includes(parts[0])) {
        // R-type instruction
        const rd = regMap[parts[1]];
        const rs = regMap[parts[2]];
        const rt = regMap[parts[3]];
        if (!rd || !rs || !rt) return "Invalid Registers";
        binaryInstruction += rs + rt + rd + "00000" + funcMap[parts[0]];
    } else if (["lw", "sw"].includes(parts[0])) {
        // I-type instruction
        const rt = regMap[parts[1]];
        const rs = regMap[parts[3].split(',')[0]];
        const immediate = parseInt(parts[2]);
        if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
        binaryInstruction += rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');
    } else if (["addi"].includes(parts[0])) {
        // I-type instruction
        const rt = regMap[parts[1]];
        const rs = regMap[parts[2]];
        const immediate = parseInt(parts[3]);
        if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
        binaryInstruction += rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');
    } else if (["beq", "bne"].includes(parts[0])) {
        // I-type instruction
        const rs = regMap[parts[1]];
        const rt = regMap[parts[2]];
        const label = parts[3];
        if (!rs || !rt) return "Invalid Registers";
        // For simplicity, assuming label is an immediate value (offset)
        const offset = parseInt(label);
        if (isNaN(offset)) return "Invalid Syntax";
        binaryInstruction += rs + rt + (offset >>> 0).toString(2).padStart(16, '0');
    } else if (["j"].includes(parts[0])) {
        // J-type instruction
        const address = parseInt(parts[1]);
        if (isNaN(address)) return "Invalid Syntax";
        binaryInstruction += (address >>> 0).toString(2).padStart(26, '0');
    } else {
        return "Unsupported Instruction";
    }

    // Convert binary instruction to hexadecimal
    const hexInstruction = parseInt(binaryInstruction, 2).toString(16).toUpperCase().padStart(8, '0');
    //return "0x" + hexInstruction;
    return hexInstruction;
}
/*
export function translateInstructionToMIPS(hexInstruction) {
    const opcodeMap = {
        "0110011": {  // R-type (funct3 y funct7)
            "000": "add", 
            "001": "sll", 
            "010": "slt", 
            "011": "sra", 
            "100": "srl", 
            "101": "sub", 
            "110": "xor", 
            "111": "or"
        },
        "0000011": "lw",     // I-type
        "0100011": "sw",     // S-type
        "1101111": "jal",    // J-type
        "1100111": "jalr",   // I-type
        "0010011": {         // I-type
            "000": "addi",
            "111": "andi",
            "110": "ori",
            "100": "xori",
            "010": "slti"
        },
        "0001000": "beq",    // B-type
        "0001010": "bne",    // B-type
        "0110111": "lui",    // U-type
        "0010111": "auipc"   // U-type
    };

    const regMap = {
        "00000": "zero", "00001": "at",  "00010": "v0",  "00011": "v1",
        "00100": "a0",   "00101": "a1",  "00110": "a2",  "00111": "a3",
        "01000": "t0",   "01001": "t1",  "01010": "t2", "01011": "t3",
        "01100": "t4",  "01101": "t5", "01110": "t6", "01111": "t7",
        "10000": "s0",  "10001": "s1", "10010": "s2", "10011": "s3",
        "10100": "s4",  "10101": "s5", "10110": "s6", "10111": "s7",
        "11000": "t8",  "11001": "t9", "11010": "k0", "11011": "k1",
        "11100": "gp",  "11101": "sp", "11110": "fp", "11111": "ra",
    };

    // Convierte la instrucción hexadecimal a binario
    const binaryInstruction = hexToBinary(hexInstruction);
    

    const opcode = binaryInstruction.slice(25, 32);  // Últimos 7 bits son el opcode
    const funct3 = binaryInstruction.slice(17, 20);  // bits 17-19 para funct3
    const funct7 = binaryInstruction.slice(0, 7);    // bits 0-6 para funct7
    
    const rs1Bin = binaryInstruction.slice(12, 17);  // bits 12-16 para rs1
    const rs2Bin = binaryInstruction.slice(7, 12);   // bits 7-11 para rs2
    const rdBin = binaryInstruction.slice(20, 25);   // bits 20-24 para rd
    const imm = parseInt(binaryInstruction.slice(20, 32), 2);  // Inmediato de 12 bits (solo para I, S, B, U)

    const rs1 = regMap[rs1Bin] || "x?(?)";
    const rs2 = regMap[rs2Bin] || "x?(?)";
    const rd = regMap[rdBin] || "x?(?)";

    let mipsInstruction = "";

    const opEntry = opcodeMap[opcode];
    if (!opEntry) return "Unknown or unsupported opcode";

    if (opcode === "0110011") {
        // R-type (funct3 y funct7)
        const instr = opEntry[funct3];
        if (instr) {
            mipsInstruction = `${instr} ${rd} ${rs1} ${rs2}`;
        } else {
            return "Unknown R-type instruction";
        }
    } else if (opcode === "0010011") {
        // I-type (addi, andi, ori, xori, slti)
        const instr = opEntry[funct3];
        if (instr) {
            mipsInstruction = `${instr} ${rd} ${rs1} ${imm}`;
        } else {
            return "Unknown I-type instruction";
        }
    } else if (opcode === "0000011") {
        // I-type (lw)
        mipsInstruction = `${opEntry} ${rd} ${rs1} ${imm}`;
    } else if (opcode === "0100011") {
        // S-type (sw)
        mipsInstruction = `${opEntry} ${rs2} ${rs1} ${imm}`;
    } else if (opcode === "1101111") {
        // J-type (jal)
        mipsInstruction = `${opEntry} ${imm}`;
    } else if (opcode === "1100111") {
        // I-type (jalr)
        mipsInstruction = `${opEntry} ${rd} ${rs1} ${imm}`;
    } else if (opcode === "0001000" || opcode === "0001010") {
        // B-type (beq, bne)
        mipsInstruction = `${opEntry} ${rs1} ${rs2} ${imm}`;
    } else if (opcode === "0110111" || opcode === "0010111") {
        // U-type (lui, auipc)
        mipsInstruction = `${opEntry} ${rd} ${imm}`;
    } else {
        return "Unsupported or unknown instruction";
    }

    console.log("Instruction Method 2",binToTextRISC(hexInstruction)); // Para debug
    return binToTextRISC(hexInstruction);
}
 */
// Helper para convertir de hexadecimal a binario
function hexToBinary(hex) {
    return parseInt(hex, 16).toString(2).padStart(32, '0');
}
export function translateInstructionToMIPS(instruction) {
    const regMap = {
        "00000": "zero", "00001": "at",  "00010": "v0",  "00011": "v1",
        "00100": "a0",   "00101": "a1",  "00110": "a2",  "00111": "a3",
        "01000": "t0",   "01001": "t1",  "01010": "t2", "01011": "t3",
        "01100": "t4",  "01101": "t5", "01110": "t6", "01111": "t7",
        "10000": "s0",  "10001": "s1", "10010": "s2", "10011": "s3",
        "10100": "s4",  "10101": "s5", "10110": "s6", "10111": "s7",
        "11000": "t8",  "11001": "t9", "11010": "k0", "11011": "k1",
        "11100": "gp",  "11101": "sp", "11110": "fp", "11111": "ra",
    };

    // Convertir el hexadecimal a binario
    const binary = parseInt(instruction, 16).toString(2).padStart(32, '0');
    
    // Obtener los campos de acuerdo al formato RISC-V
    const opcode = binary.slice(25, 32);        // bits 6–0 (lsb)
    const rd = binary.slice(20, 25);            // bits 11–7
    const funct3 = binary.slice(17, 20);        // bits 14–12
    const rs1 = binary.slice(12, 17);           // bits 19–15
    const rs2 = binary.slice(7, 12);            // bits 24–20
    const funct7 = binary.slice(0, 7);          // bits 31–25
    const immI = parseInt(binary.slice(0, 12), 2); // Inmediato para instrucciones tipo I
    const signedImm = immI >= 0x800 ? immI - 0x1000 : immI;
    const immS = parseInt(binary.slice(7, 12) + binary.slice(25, 32), 2); // Inmediato para instrucciones tipo S
    const immB = parseInt(binary.slice(8, 12) + binary.slice(25, 32) + binary.slice(7, 8), 2); // Inmediato para instrucciones tipo B
    const immU = parseInt(binary.slice(12, 32), 2); // Inmediato para instrucciones tipo U
    const immJ = parseInt(binary.slice(1, 11) + binary.slice(20, 32) + binary.slice(11, 12) + binary.slice(0, 1), 2); // Inmediato para instrucciones tipo J

    // Usamos el regMap para obtener los registros por su código binario
    const reg1 = regMap[rs1];
    const reg2 = regMap[rs2];
    const regDest = regMap[rd];

    // Verificación simple para asegurarnos de que los registros son válidos
    if (!reg1 || !reg2 || !regDest) {
        return 'Error: Registros no encontrados';
    }

    // Interpretar las instrucciones según el opcode
    switch (opcode) {
        case '0110011': // R-type (operaciones aritméticas)
            if (funct3 === '000' && funct7 === '0000000') {
                return `add ${regDest}, ${reg1}, ${reg2}`;
            }
            if (funct3 === '000' && funct7 === '0100000') {
                return `sub ${regDest}, ${reg1}, ${reg2}`;
            }
            if (funct3 === '001' && funct7 === '0000000') {
                return `sll ${regDest}, ${reg1}, ${reg2}`;
            }
            if (funct3 === '010' && funct7 === '0000000') {
                return `slt ${regDest}, ${reg1}, ${reg2}`;
            }
            if (funct3 === '011' && funct7 === '0000000') {
                return `sltu ${regDest}, ${reg1}, ${reg2}`;
            }
            if (funct3 === '100' && funct7 === '0000000') {
                return `xor ${regDest}, ${reg1}, ${reg2}`;
            }
            if (funct3 === '101' && funct7 === '0000000') {
                return `srl ${regDest}, ${reg1}, ${reg2}`;
            }
            if (funct3 === '101' && funct7 === '0100000') {
                return `sra ${regDest}, ${reg1}, ${reg2}`;
            }
            if (funct3 === '110' && funct7 === '0000000') {
                return `or ${regDest}, ${reg1}, ${reg2}`;
            }
            if (funct3 === '111' && funct7 === '0000000') {
                return `and ${regDest}, ${reg1}, ${reg2}`;
            }
            break;

        case '0000011': // I-type (load)
            if (funct3 === '010') {
                return `lw ${regDest}, ${signedImm} (${reg1})`;
            }
            if (funct3 === '000') {
                return `lb ${regDest}, ${signedImm} (${reg1})`;
            }
            if (funct3 === '001') {
                return `lh ${regDest}, ${signedImm} (${reg1})`;
            }
            if (funct3 === '100') {
                return `lbu ${regDest}, ${signedImm} (${reg1})`;
            }
            if (funct3 === '101') {
                return `lhu ${regDest}, ${signedImm} (${reg1})`;
            }
            break;

        case '0010011': // I-type (arithmético)
            if (funct3 === '000') {
                return `addi ${regDest}, ${reg1}, ${signedImm}`;
            }
            if (funct3 === '010') {
                return `slti ${regDest}, ${reg1}, ${signedImm}`;
            }
            if (funct3 === '011') {
                return `sltiu ${regDest}, ${reg1}, ${signedImm}`;
            }
            if (funct3 === '100') {
                return `xori ${regDest}, ${reg1}, ${signedImm}`;
            }
            if (funct3 === '110') {
                return `ori ${regDest}, ${reg1}, ${signedImm}`;
            }
            if (funct3 === '111') {
                return `andi ${regDest}, ${reg1}, ${signedImm}`;
            }
            if (funct3 === '001') {
                return `slli ${regDest}, ${reg1}, ${signedImm}`;
            }
            if (funct3 === '101') {
                if (funct7 === '0000000') {
                    return `srli ${regDest}, ${reg1}, ${signedImm}`;
                }
                if (funct7 === '0100000') {
                    return `srai ${regDest}, ${reg1}, ${signedImm}`;
                }
            }
            break;

        case '1100011': // B-type (branch)
            if (funct3 === '000') {
                return `beq ${reg1}, ${reg2}, ${immB}`;
            }
            if (funct3 === '001') {
                return `bne ${reg1}, ${reg2}, ${immB}`;
            }
            if (funct3 === '100') {
                return `blt ${reg1}, ${reg2}, ${immB}`;
            }
            if (funct3 === '101') {
                return `bge ${reg1}, ${reg2}, ${immB}`;
            }
            if (funct3 === '110') {
                return `bltu ${reg1}, ${reg2}, ${immB}`;
            }
            if (funct3 === '111') {
                return `bgeu ${reg1}, ${reg2}, ${immB}`;
            }
            break;

        case '0100011': // S-type (store)
            if (funct3 === '010') {
                return `sw ${reg2}, ${immS} (${reg1})`;
            }
            if (funct3 === '000') {
                return `sb ${reg2}, ${immS} (${reg1})`;
            }
            if (funct3 === '001') {
                return `sh ${reg2}, ${immS} (${reg1})`;
            }
            break;

        case '1101111': // J-type (jal)
            return `jal ${regDest}, ${immJ}`;

        case '1100111': // I-type (jalr)
            return `jalr ${regDest}, ${immI} (${reg1})`;

        case '0110111': // U-type (lui)
            return `lui ${regDest}, ${immU}`;

        case '0010111': // U-type (auipc)
            return `auipc ${regDest}, ${immU}`;

        case '0000000': // NOP (instrucción no válida, 0x00000000)
            return 'nop';

        default:
            return 'Instrucción desconocida';
    }

    return 'Instrucción no soportada';
}
