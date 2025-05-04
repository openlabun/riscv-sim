"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Cpu, Upload, Play, StepForward, RotateCcw, Code, Github } from "lucide-react"

import { initializeRegisters, initializeMemory, binaryToDecimal, binaryToHex } from "@/lib/utils"
import { executeInstructionWithTracking, determineTabToShow } from "@/lib/simulator"
import { groupRegistersByType } from "@/lib/registers"
import { type DisplayFormat, type TabValue, RegisterType } from "@/lib/types"

export default function Home() {
  // State for UI
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [lineNumber, setLineNumber] = useState(1)
  const [currentLine, setCurrentLine] = useState(1)
  const [logMessages, setLogMessages] = useState<string[]>([])
  const [code, setCode] = useState<string[]>([
    "# Welcome to RISC-V Simulator",
    "# Start typing your RISC-V assembly code here",
    "",
    "# Use the Step button to execute one instruction at a time",
    "# Use the Run button to execute the entire program",
    "",
  ])

  // State for simulator
  const [registers, setRegisters] = useState(initializeRegisters())
  const [memory, setMemory] = useState(initializeMemory())
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>("decimal")
  const [activeTab, setActiveTab] = useState<TabValue>("x-registers")
  const [autoSwitching, setAutoSwitching] = useState(false)
  const [showRelativeAddress, setShowRelativeAddress] = useState(false)
  const [lastModifiedRegisters, setLastModifiedRegisters] = useState<string[]>([])
  const [lastModifiedMemory, setLastModifiedMemory] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const collaborators = [
    {
      name: "Samuel Matiz",
      username: "MatizS27",
      image: "/collaborators/samuel.png",
      github: "https://github.com/MatizS27",
    },
    {
      name: "Juan F. Santos",
      username: "PipeJF9",
      image: "/collaborators/juan.png",
      github: "https://github.com/PipeJF9",
    },
    {
      name: "Camilo Navarro",
      username: "NavarroCamilo",
      image: "/collaborators/camilo.png",
      github: "https://github.com/NavarroCamilo",
    },
    {
      name: "Anghely Ramos",
      username: "Angeramos",
      image: "/collaborators/anghely.png",
      github: "https://github.com/Angeramos",
    },
  ]

  // UI state
  const [isDragging, setIsDragging] = useState(false)
  const [scrollTop, setScrollTop] = useState(0)
  const [isLineVisible, setIsLineVisible] = useState(true)

  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const registersContainerRef = useRef<HTMLDivElement>(null)

  // Add a log message
  const addLogMessage = (message: string) => {
    setLogMessages((prev) => [message, ...prev])
  }

  // Clear log messages
  const clearLog = () => {
    setLogMessages([])
  }

  // Reset simulator
  const resetSimulator = () => {
    setRegisters(initializeRegisters())
    setMemory(initializeMemory())
    setCurrentLine(1)
    setLastModifiedRegisters([])
    setLastModifiedMemory([])
    addLogMessage("Simulator reset")
  }

  // Go to specific line
  const goToLine = () => {
    if (lineNumber > 0 && lineNumber <= code.length) {
      setCurrentLine(lineNumber)

      // Focus the editor and place cursor at the beginning of the selected line
      if (editorRef.current) {
        editorRef.current.focus()

        // Calculate position to place cursor
        const linesBeforeCurrent = code.slice(0, lineNumber - 1)
        const position = linesBeforeCurrent.reduce((acc, line) => acc + line.length + 1, 0)

        editorRef.current.setSelectionRange(position, position)
      }
    }
  }

  // Handle code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value.split("\n")
    setCode(newCode)
  }

  // Execute current line
  const stepExecution = () => {
    if (currentLine <= code.length) {
      const instruction = code[currentLine - 1].trim()

      // Skip comments and empty lines
      if (instruction === "" || instruction.startsWith("#")) {
        setCurrentLine((prev) => prev + 1)
        addLogMessage(`Skipping line ${currentLine}: ${instruction}`)
        return
      }

      // Execute the instruction with tracking
      const result = executeInstructionWithTracking(instruction, registers, memory)

      if (result.success) {
        addLogMessage(result.message || `Executed line ${currentLine}: ${instruction}`)

        // Update state with modifications
        setRegisters({ ...registers })
        setMemory({ ...memory })
        setLastModifiedRegisters(result.modifiedRegisters || [])
        setLastModifiedMemory(result.modifiedMemory || [])

        // Auto-switch tab if enabled
        if (autoSwitching) {
          const tabToShow = determineTabToShow(result.modifiedRegisters, result.modifiedMemory)
          if (tabToShow) {
            setActiveTab(tabToShow as TabValue)
          }
        }

        // Move to next line
        setCurrentLine((prev) => prev + 1)
      } else {
        addLogMessage(result.message || "Execution failed")
      }
    } else {
      addLogMessage("End of program reached")
    }
  }

  // Run all instructions
  const runExecution = async () => {
    // Filter out empty lines and comments
    const instructions = code.filter((line) => line.trim() !== "" && !line.trim().startsWith("#"))

    if (instructions.length === 0) {
      addLogMessage("No instructions to execute")
      return
    }

    setIsRunning(true)

    // Reset to beginning
    setCurrentLine(1)

    // Execute all instructions
    let currentLineIndex = 0
    let success = true

    while (currentLineIndex < code.length && success) {
      const instruction = code[currentLineIndex].trim()

      // Skip comments and empty lines
      if (instruction === "" || instruction.startsWith("#")) {
        currentLineIndex++
        setCurrentLine(currentLineIndex + 1)
        continue
      }

      // Execute the instruction
      const result = executeInstructionWithTracking(instruction, registers, memory)

      if (result.success) {
        addLogMessage(result.message || `Executed line ${currentLineIndex + 1}: ${instruction}`)

        // Update state with modifications
        setRegisters({ ...registers })
        setMemory({ ...memory })
        setLastModifiedRegisters(result.modifiedRegisters || [])
        setLastModifiedMemory(result.modifiedMemory || [])

        // Auto-switch tab if enabled
        if (autoSwitching) {
          const tabToShow = determineTabToShow(result.modifiedRegisters, result.modifiedMemory)
          if (tabToShow) {
            setActiveTab(tabToShow as TabValue)
          }
        }

        // Move to next line
        currentLineIndex++
        setCurrentLine(currentLineIndex + 1)

        // Small delay to allow UI updates
        await new Promise((resolve) => setTimeout(resolve, 10))
      } else {
        addLogMessage(result.message || "Execution failed")
        success = false
      }
    }

    setIsRunning(false)
    addLogMessage(success ? "Program execution completed" : "Program execution halted due to errors")
  }

  // Format register value based on selected display format
  const formatRegisterValue = (binary: string) => {
    if (!binary) return "0"

    switch (displayFormat) {
      case "decimal":
        return binaryToDecimal(binary)
      case "hex":
        return binaryToHex(binary)
      case "binary":
        return binary.match(/.{1,4}/g)?.join(" ") || binary
      default:
        return binaryToDecimal(binary)
    }
  }

  // Check if a register was modified in the last execution
  const isRegisterModified = (binary: string) => {
    return lastModifiedRegisters.includes(binary)
  }

  // Check if a memory address was modified in the last execution
  const isMemoryModified = (address: string) => {
    return lastModifiedMemory.includes(address)
  }

  // Sync scrolling between editor and line numbers and check if current line is visible
  const handleEditorScroll = () => {
    if (editorRef.current && lineNumbersRef.current) {
      const newScrollTop = editorRef.current.scrollTop
      setScrollTop(newScrollTop)
      lineNumbersRef.current.scrollTop = newScrollTop

      // Check if current line is visible
      const lineHeight = 24 // Height of each line in pixels
      const editorHeight = editorRef.current.clientHeight
      const linePosition = (currentLine - 1) * lineHeight

      setIsLineVisible(linePosition >= newScrollTop && linePosition < newScrollTop + editorHeight)
    }
  }

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length === 0) return

    const file = files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (event.target?.result) {
        const content = event.target.result as string
        setCode(content.split("\n"))
        addLogMessage(`File loaded: ${file.name}`)
      }
    }

    reader.onerror = () => {
      addLogMessage(`Error reading file: ${file.name}`)
    }

    reader.readAsText(file)
  }

  // Group registers by type for display
  const groupedRegisters = groupRegistersByType(registers)

  // Get memory entries for display
  const memoryEntries = Object.entries(memory)
    .map(([address, value]) => ({
      address,
      value,
      isModified: isMemoryModified(address),
    }))
    .sort((a, b) => Number.parseInt(a.address, 2) - Number.parseInt(b.address, 2))

  // Ensure the highlighted line is visible when changed
  useEffect(() => {
    if (editorRef.current) {
      const lineHeight = 24 // Height of each line in pixels
      const editorHeight = editorRef.current.clientHeight
      const scrollPosition = editorRef.current.scrollTop
      const linePosition = (currentLine - 1) * lineHeight

      // If the line is outside the visible area, scroll to it
      if (linePosition < scrollPosition || linePosition > scrollPosition + editorHeight - lineHeight) {
        editorRef.current.scrollTop = linePosition - editorHeight / 2 + lineHeight

        // Also update line numbers scroll position
        if (lineNumbersRef.current) {
          lineNumbersRef.current.scrollTop = editorRef.current.scrollTop
        }

        // Update scroll state
        setScrollTop(editorRef.current.scrollTop)
        setIsLineVisible(true)
      }
    }
  }, [currentLine])

  // Initialize with welcome message
  useEffect(() => {
    setLogMessages(["System initialized", "Ready to execute RISC-V instructions"])
  }, [])

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#F5F7FA]">
      {/* Main Content with RISC-V inspired styling */}
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left Panel - Code Editor */}
        <div className="w-1/2 flex flex-col rounded-xl overflow-hidden shadow-lg bg-white border border-[#3949AB]/10">
          <div className="flex items-center gap-3 p-3 bg-[#3949AB] text-white">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <Cpu className="h-5 w-5 text-[#FFC107]" />
              <span className="font-bold tracking-tight">RISC-V Simulator</span>
            </div>
            <span className="text-xs text-white/70">Universidad del Norte</span>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2">
                <span className="text-sm">Line:</span>
                <Input
                  type="number"
                  value={lineNumber}
                  min={1}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    setLineNumber(value < 1 ? 1 : value)
                  }}
                  onBlur={() => {
                    if (isNaN(lineNumber) || lineNumber < 1) {
                      setLineNumber(1)
                    }
                  }}
                  className="w-24 h-7 bg-white border-none text-[#3949AB] focus-visible:ring-[#FFC107]"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToLine}
                className="h-7 bg-[#FFC107] border-none text-[#3949AB] hover:bg-[#FFC107]/90 hover:text-[#3949AB] font-medium shadow-md"
              >
                Go!
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden font-mono text-sm p-0 bg-white relative">
            <div className="flex h-full">
              {/* Line numbers - scrollable container */}
              <div
                ref={lineNumbersRef}
                className="w-12 bg-gradient-to-b from-[#3949AB]/5 to-[#3949AB]/10 text-[#3949AB] text-right select-none border-r border-[#3949AB]/10 overflow-y-hidden"
              >
                <div>
                  {code.map((_, i) => (
                    <div
                      key={i}
                      className={`px-2 py-0 h-6 flex items-center justify-end cursor-pointer hover:bg-[#3949AB]/20 transition-colors ${
                        currentLine === i + 1 ? "font-bold text-[#FFC107]" : ""
                      }`}
                      onClick={() => {
                        setCurrentLine(i + 1)
                        setLineNumber(i + 1)

                        // Focus the editor and place cursor at the beginning of the selected line
                        if (editorRef.current) {
                          editorRef.current.focus()

                          // Calculate position to place cursor
                          const linesBeforeCurrent = code.slice(0, i)
                          const position = linesBeforeCurrent.reduce((acc, line) => acc + line.length + 1, 0)

                          editorRef.current.setSelectionRange(position, position)
                        }
                      }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Code editor container */}
              <div className="flex-1 relative overflow-hidden">
                {/* Highlight overlay for current line - only visible when line is in view */}
                {isLineVisible && (
                  <div
                    className="absolute left-0 right-0 h-6 bg-[#3949AB]/10 border-l-2 border-[#FFC107] z-10 pointer-events-none"
                    style={{
                      top: `${(currentLine - 1) * 24 - scrollTop}px`,
                    }}
                  ></div>
                )}

                {/* Editable text area */}
                <textarea
                  ref={editorRef}
                  value={code.join("\n")}
                  onChange={handleCodeChange}
                  onScroll={handleEditorScroll}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`absolute top-0 left-0 right-0 bottom-0 p-0 pl-2 outline-none resize-none font-mono text-sm text-[#3949AB] bg-transparent z-5 overflow-auto ${
                    isDragging ? "bg-[#3949AB]/5" : ""
                  }`}
                  style={{ lineHeight: "24px" }}
                  spellCheck="false"
                  placeholder="Type your RISC-V assembly code here..."
                  disabled={isRunning}
                />

                {/* Drop zone overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-[#3949AB]/10 flex items-center justify-center z-20 pointer-events-none">
                    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
                      <Upload className="h-5 w-5 text-[#3949AB]" />
                      <span className="text-[#3949AB] font-medium">Drop file to load code</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-b from-white to-slate-50 border-t border-[#3949AB]/10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stepExecution}
                    disabled={isRunning || currentLine > code.length}
                    className="h-9 bg-[#3949AB] text-white hover:opacity-90 border-none shadow-md px-4 flex items-center gap-2"
                  >
                    <StepForward className="h-4 w-4" />
                    Step
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Execute one instruction</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={runExecution}
                    disabled={isRunning}
                    className="h-9 bg-[#FFC107] text-[#3949AB] hover:opacity-90 border-none shadow-md font-medium px-4 flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Run
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Run until completion</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex items-center gap-2 ml-2 bg-white px-3 py-1.5 rounded-full border border-[#3949AB]/10 shadow-sm">
              <Checkbox
                id="auto-switch"
                checked={autoSwitching}
                onCheckedChange={(checked) => setAutoSwitching(!!checked)}
                className="text-[#FFC107] border-[#3949AB]/30 data-[state=checked]:bg-[#FFC107] data-[state=checked]:text-[#3949AB]"
              />
              <label htmlFor="auto-switch" className="text-sm text-[#3949AB] font-medium">
                Enable auto switching
              </label>
            </div>

            <div className="flex items-center ml-auto">
              <input
                type="file"
                id="file-upload"
                accept=".txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        const content = event.target.result as string
                        setCode(content.split("\n"))
                        addLogMessage(`File loaded: ${file.name}`)
                      }
                    }
                    reader.onerror = () => {
                      addLogMessage(`Error reading file: ${file.name}`)
                    }
                    reader.readAsText(file)
                  }
                }}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      className="h-9 border-[#3949AB]/30 text-[#3949AB] hover:bg-[#3949AB]/5 flex items-center gap-2"
                      disabled={isRunning}
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Upload instructions file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulator}
              disabled={isRunning}
              className="h-9 ml-2 border-[#3949AB]/30 text-[#3949AB] hover:bg-[#3949AB]/5 flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Right Panel - Registers and Memory */}
        <div className="w-1/2 flex flex-col rounded-xl overflow-hidden shadow-lg bg-white border border-[#3949AB]/10">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabValue)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="flex h-12 w-full bg-[#3949AB] rounded-none p-1 px-2 gap-1 overflow-x-auto whitespace-nowrap shadow-md">
              <TabsTrigger
                value="x-registers"
                className="rounded-md data-[state=active]:bg-[#FFC107] data-[state=active]:text-[#3949AB] data-[state=active]:shadow-md text-white transition-all"
              >
                X
              </TabsTrigger>
              <TabsTrigger
                value="s-registers"
                className="rounded-md data-[state=active]:bg-[#FFC107] data-[state=active]:text-[#3949AB] data-[state=active]:shadow-md text-white transition-all"
              >
                S
              </TabsTrigger>
              <TabsTrigger
                value="t-registers"
                className="rounded-md data-[state=active]:bg-[#FFC107] data-[state=active]:text-[#3949AB] data-[state=active]:shadow-md text-white transition-all"
              >
                T
              </TabsTrigger>
              <TabsTrigger
                value="a-registers"
                className="rounded-md data-[state=active]:bg-[#FFC107] data-[state=active]:text-[#3949AB] data-[state=active]:shadow-md text-white transition-all"
              >
                A
              </TabsTrigger>
              <TabsTrigger
                value="stack"
                className="rounded-md data-[state=active]:bg-[#FFC107] data-[state=active]:text-[#3949AB] data-[state=active]:shadow-md text-white transition-all"
              >
                Stack
              </TabsTrigger>
              <TabsTrigger
                value="log"
                className="rounded-md data-[state=active]:bg-[#FFC107] data-[state=active]:text-[#3949AB] data-[state=active]:shadow-md text-white transition-all"
              >
                Log
              </TabsTrigger>
            </TabsList>

            {/* Format selector and options */}
            <div className="p-3 border-b border-[#FFC107]/10 flex items-center gap-3 bg-gradient-to-b from-slate-50 to-white">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#3949AB]/10 shadow-sm">
                <Checkbox
                  id="relative-address"
                  checked={showRelativeAddress}
                  onCheckedChange={(checked) => setShowRelativeAddress(!!checked)}
                  className="text-[#FFC107] border-[#3949AB]/30 data-[state=checked]:bg-[#FFC107] data-[state=checked]:text-[#3949AB]"
                />
                <label htmlFor="relative-address" className="text-sm text-[#3949AB] font-medium">
                  show relative address
                </label>
              </div>
              <Select
                defaultValue="decimal"
                value={displayFormat}
                onValueChange={(value) => setDisplayFormat(value as DisplayFormat)}
              >
                <SelectTrigger className="w-32 h-9 border-[#3949AB]/20 focus:ring-[#FFC107] bg-white shadow-sm">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="decimal">Decimal</SelectItem>
                  <SelectItem value="hex">Hexadecimal</SelectItem>
                  <SelectItem value="binary">Binary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* X Registers Tab */}
            <TabsContent
              value="x-registers"
              className="flex-1 p-0 m-0 bg-white overflow-auto border border-[#3949AB]/10 rounded-b-lg"
            >
              <div className="min-w-full">
                <table className="w-full text-sm">
                  <tbody>
                    {/* PC Register */}
                    <tr
                      className={`bg-gradient-to-r from-[#3949AB]/10 to-[#3949AB]/20 ${isRegisterModified("PC") ? "bg-[#FFC107]/20" : ""}`}
                    >
                      <td className="p-2 pl-3 w-32 text-[#3949AB] font-medium">PC:</td>
                      <td className={`p-2 ${isRegisterModified("PC") ? "text-[#3949AB] font-bold" : "text-[#3949AB]"}`}>
                        {formatRegisterValue(registers["PC"])}
                      </td>
                    </tr>

                    {/* X Registers */}
                    {groupedRegisters[RegisterType.X].map((register, index) => (
                      <tr
                        key={register.binary}
                        className={`${index % 2 === 0 ? "bg-gradient-to-r from-[#3949AB]/5 to-[#3949AB]/10" : "bg-white"} 
                                   ${isRegisterModified(register.binary) ? "bg-[#FFC107]/20" : ""}`}
                      >
                        <td className="p-2 pl-3 w-32 text-[#3949AB] font-medium">
                          {register.name} {register.alias ? `(${register.alias})` : ""}:
                        </td>
                        <td
                          className={`p-2 ${isRegisterModified(register.binary) ? "text-[#3949AB] font-bold" : "text-[#3949AB]"}`}
                        >
                          {formatRegisterValue(register.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* S Registers Tab */}
            <TabsContent
              value="s-registers"
              className="flex-1 p-0 m-0 bg-white overflow-auto border border-[#3949AB]/10 rounded-b-lg"
            >
              <div className="min-w-full">
                <table className="w-full text-sm">
                  <tbody>
                    {groupedRegisters[RegisterType.S].map((register, index) => (
                      <tr
                        key={register.binary}
                        className={`${index % 2 === 0 ? "bg-gradient-to-r from-[#3949AB]/5 to-[#3949AB]/10" : "bg-white"} 
                                   ${isRegisterModified(register.binary) ? "bg-[#FFC107]/20" : ""}`}
                      >
                        <td className="p-2 pl-3 w-32 text-[#3949AB] font-medium">
                          {register.name} {register.alias ? `(${register.alias})` : ""}:
                        </td>
                        <td
                          className={`p-2 ${isRegisterModified(register.binary) ? "text-[#3949AB] font-bold" : "text-[#3949AB]"}`}
                        >
                          {formatRegisterValue(register.value)}
                        </td>
                      </tr>
                    ))}
                    {groupedRegisters[RegisterType.S].length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-[#3949AB]/70">
                          No saved registers to display
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* T Registers Tab */}
            <TabsContent
              value="t-registers"
              className="flex-1 p-0 m-0 bg-white overflow-auto border border-[#3949AB]/10 rounded-b-lg"
            >
              <div className="min-w-full">
                <table className="w-full text-sm">
                  <tbody>
                    {groupedRegisters[RegisterType.T].map((register, index) => (
                      <tr
                        key={register.binary}
                        className={`${index % 2 === 0 ? "bg-gradient-to-r from-[#3949AB]/5 to-[#3949AB]/10" : "bg-white"} 
                                   ${isRegisterModified(register.binary) ? "bg-[#FFC107]/20" : ""}`}
                      >
                        <td className="p-2 pl-3 w-32 text-[#3949AB] font-medium">
                          {register.name} {register.alias ? `(${register.alias})` : ""}:
                        </td>
                        <td
                          className={`p-2 ${isRegisterModified(register.binary) ? "text-[#3949AB] font-bold" : "text-[#3949AB]"}`}
                        >
                          {formatRegisterValue(register.value)}
                        </td>
                      </tr>
                    ))}
                    {groupedRegisters[RegisterType.T].length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-[#3949AB]/70">
                          No temporary registers to display
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* A Registers Tab */}
            <TabsContent
              value="a-registers"
              className="flex-1 p-0 m-0 bg-white overflow-auto border border-[#3949AB]/10 rounded-b-lg"
            >
              <div className="min-w-full">
                <table className="w-full text-sm">
                  <tbody>
                    {groupedRegisters[RegisterType.A].map((register, index) => (
                      <tr
                        key={register.binary}
                        className={`${index % 2 === 0 ? "bg-gradient-to-r from-[#3949AB]/5 to-[#3949AB]/10" : "bg-white"} 
                                   ${isRegisterModified(register.binary) ? "bg-[#FFC107]/20" : ""}`}
                      >
                        <td className="p-2 pl-3 w-32 text-[#3949AB] font-medium">
                          {register.name} {register.alias ? `(${register.alias})` : ""}:
                        </td>
                        <td
                          className={`p-2 ${isRegisterModified(register.binary) ? "text-[#3949AB] font-bold" : "text-[#3949AB]"}`}
                        >
                          {formatRegisterValue(register.value)}
                        </td>
                      </tr>
                    ))}
                    {groupedRegisters[RegisterType.A].length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-[#3949AB]/70">
                          No argument registers to display
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Stack Tab */}
            <TabsContent
              value="stack"
              className="flex-1 p-0 m-0 bg-white overflow-auto border border-[#3949AB]/10 rounded-b-lg"
            >
              <div className="px-6">
                {memoryEntries.length > 0 ? (
                  memoryEntries.map((entry, index) => (
                    <div
                      key={entry.address}
                      className={`flex justify-between py-2 ${index % 2 === 0 ? "bg-gray-100" : ""} 
                               ${entry.isModified ? "bg-[#FFC107]/20" : ""}`}
                    >
                      <div className="text-[#3949AB] font-medium">
                        {showRelativeAddress
                          ? `+${(Number.parseInt(entry.address, 2) - Number.parseInt(registers["PC"], 2)).toString(16).toUpperCase()}`
                          : binaryToHex(entry.address)}
                        :
                      </div>
                      <div className={`${entry.isModified ? "text-[#3949AB] font-bold" : "text-[#3949AB]"}`}>
                        {formatRegisterValue(entry.value)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#3949AB]/70">No stack entries to display</div>
                )}
              </div>
            </TabsContent>
            {/* Log Tab */}
            <TabsContent
              value="log"
              className="flex-1 p-0 m-0 bg-white flex flex-col border border-[#3949AB]/10 rounded-b-lg"
            >
              <div className="flex-1 overflow-auto p-4">
                {logMessages.map((message, index) => (
                  <div
                    key={index}
                    className="mb-2 p-3 bg-[#3949AB]/10 text-[#3949AB] rounded-md border-l-2 border-[#FFC107]"
                  >
                    {message}
                  </div>
                ))}
                {logMessages.length === 0 && (
                  <div className="text-center text-[#3949AB]/50 mt-4">No log messages to display</div>
                )}
              </div>
              <div className="p-4 border-t border-[#3949AB]/10 bg-white">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearLog}
                  className="border-[#3949AB]/20 hover:bg-[#3949AB]/5 text-[#3949AB]"
                >
                  Clear Log
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Collaborators Panel */}
      {showCollaborators && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="bg-[#3949AB] p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-[#FFC107]" />
                RISC-V Simulator Team
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCollaborators(false)}
                className="bg-[#FFC107] text-[#3949AB] border-none hover:bg-[#FFC107]/90"
              >
                Close
              </Button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {collaborators.map((collaborator, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border border-[#3949AB]/10 bg-gradient-to-r from-slate-50 to-white"
                >
                  <div className="w-16 h-16 rounded-full bg-[#3949AB]/10 overflow-hidden flex items-center justify-center">
                    <img
                      src={collaborator.image || "/placeholder.svg"}
                      alt={collaborator.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(collaborator.name)}&background=3949AB&color=fff`
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-[#3949AB]">{collaborator.name}</h3>
                    {collaborator.username && (
                      <a
                        href={collaborator.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#3949AB]/70 hover:text-[#3949AB] flex items-center gap-1 mt-1"
                      >
                        <Github className="h-3.5 w-3.5" />@{collaborator.username}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-slate-50 to-white p-4 border-t border-[#3949AB]/10"></div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-3 px-6 bg-[#3949AB] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white/10 rounded-full px-3 py-1 flex items-center">
              <Code className="h-4 w-4 text-[#FFC107] mr-1.5" />
              <span className="text-xs font-medium">RISC-V Simulator © {new Date().getFullYear()}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCollaborators(!showCollaborators)}
            className="text-xs bg-[#FFC107] text-[#3949AB] hover:bg-[#FFC107]/90 hover:text-[#3949AB] border-[#FFC107] font-medium rounded-full px-4 shadow-md"
          >
            Show Collaborators
          </Button>
        </div>
      </footer>
    </div>
  )
}
