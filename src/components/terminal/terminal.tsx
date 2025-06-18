"use client";

import { useState, useEffect, useRef } from "react";

interface OutputLine {
  type: "info" | "command" | "result";
  content: string;
  color?: string;
  time?: string;
  path?: string;
}

interface FileSystemNode {
  [key: string]: FileSystemNode | "file";
}

export default function Terminal() {
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [currentPath, setCurrentPath] = useState<string>("/home/tushar");
  const terminalRef = useRef<HTMLDivElement>(null);

  const username = "tushar";
  const hostname = "fedora";

  // File system structure
  const fileSystem: FileSystemNode = {
    "/": {
      home: {
        tushar: {
          Documents: {
            "notes.txt": "file",
            projects: {
              "web-app": {
                "index.html": "file",
                "style.css": "file",
              },
            },
          },
          Downloads: {
            "file.zip": "file",
            "image.png": "file",
          },
          Desktop: {},
          ".bashrc": "file",
          ".vimrc": "file",
        },
      },
      etc: {
        passwd: "file",
        hosts: "file",
        fstab: "file",
      },
      usr: {
        bin: {
          ls: "file",
          cat: "file",
          vim: "file",
        },
        local: {},
      },
      var: {
        log: {
          messages: "file",
          "auth.log": "file",
        },
      },
    },
  };

  useEffect(() => {
    // Welcome message
    setOutput([
      {
        type: "info",
        content: "Welcome to Fedora Linux Terminal",
        color: "text-mocha-blue",
      },
      {
        type: "info",
        content: "Type 'help' to see available commands",
        color: "text-mocha-text",
      },
      { type: "info", content: "", color: "" },
    ]);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output, currentInput]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getShortPath = () => {
    return currentPath.replace("/home/tushar", "~");
  };

  const resolvePath = (path: string): string => {
    if (path.startsWith("/")) {
      return path;
    } else if (path.startsWith("~")) {
      return path.replace("~", "/home/tushar");
    } else if (path === "..") {
      const parts = currentPath.split("/").filter((p) => p);
      parts.pop();
      return "/" + parts.join("/");
    } else if (path === ".") {
      return currentPath;
    } else {
      return currentPath === "/" ? "/" + path : currentPath + "/" + path;
    }
  };

  const getDirectory = (path: string): FileSystemNode | "file" | null => {
    const parts = path.split("/").filter((p) => p);
    let current = fileSystem["/"];

    for (const part of parts) {
      if (current && typeof current === "object" && current[part]) {
        current = current[part];
      } else {
        return null;
      }
    }

    return current;
  };

  const executeCommand = (command: string): void => {
    const time = getCurrentTime();
    const shortPath = getShortPath();

    // Add command to output with prompt
    const newOutput = [
      ...output,
      {
        type: "command",
        content: command,
        time: time,
        path: shortPath,
      },
    ];

    if (!command.trim()) {
      setOutput(newOutput as OutputLine[]);
      return;
    }

    // Add to history
    setHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    const parts = command.trim().split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);

    let result = "";
    let resultColor = "text-mocha-text";

    switch (cmd) {
      case "help":
        result = `Available commands:
  ls [path]     - list directory contents
  cd [path]     - change directory
  pwd           - print working directory
  cat [file]    - display file contents
  mkdir [dir]   - create directory
  touch [file]  - create empty file
  echo [text]   - display text
  whoami        - display current user
  date          - display current date and time
  uname         - display system information
  history       - show command history
  clear         - clear the terminal
  help          - display this help message`;
        resultColor = "text-blue-400";
        break;

      case "ls":
        const lsPath = args[0] || currentPath;
        const resolvedPath = resolvePath(lsPath);
        const dir = getDirectory(resolvedPath);

        if (!dir) {
          result = `ls: cannot access '${
            args[0] || "."
          }': No such file or directory`;
          resultColor = "text-red-400";
        } else if (typeof dir === "string") {
          result = `ls: cannot access '${args[0] || "."}': Not a directory`;
          resultColor = "text-red-400";
        } else {
          const entries = Object.keys(dir);
          if (entries.length === 0) {
            result = "";
          } else {
            result = entries
              .map((entry: string) => {
                const node = dir[entry];
                return node === "file" ? entry : `${entry}/`;
              })
              .join("  ");
          }
        }
        break;

      case "pwd":
        result = currentPath;
        break;

      case "cd":
        const cdPath = args[0] || "~";
        if (cdPath === "~" || cdPath === "") {
          setCurrentPath("/home/tushar");
        } else {
          const resolvedCdPath = resolvePath(cdPath);
          const cdDir = getDirectory(resolvedCdPath);

          if (!cdDir) {
            result = `cd: ${cdPath}: No such file or directory`;
            resultColor = "text-red-400";
          } else if (typeof cdDir === "string") {
            result = `cd: ${cdPath}: Not a directory`;
            resultColor = "text-red-400";
          } else {
            setCurrentPath(resolvedCdPath);
          }
        }
        break;

      case "clear":
        setOutput([]);
        return;

      case "whoami":
        result = username;
        break;

      case "date":
        result = new Date().toString();
        break;

      case "echo":
        result = args.join(" ");
        break;

      case "uname":
        result =
          "Linux fedora 6.8.5-301.fc40.x86_64 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux";
        break;

      case "history":
        result = history.map((cmd, index) => `${index + 1}  ${cmd}`).join("\n");
        break;

      case "cat":
        if (!args[0]) {
          result = "cat: missing file operand";
          resultColor = "text-red-400";
        } else {
          result = `Content of ${args[0]}`;
        }
        break;

      case "mkdir":
        if (!args[0]) {
          result = "mkdir: missing operand";
          resultColor = "text-red-400";
        } else {
          result = ""; // Success, no output
        }
        break;

      case "touch":
        if (!args[0]) {
          result = "touch: missing file operand";
          resultColor = "text-red-400";
        } else {
          result = ""; // Success, no output
        }
        break;

      default:
        result = `fish: ${cmd}: command not found`;
        resultColor = "text-red-400";
    }

    // Add result to output
    const finalOutput = [...newOutput];
    if (result) {
      finalOutput.push({
        type: "result",
        content: result,
        color: resultColor,
      });
    }

    setOutput(finalOutput as OutputLine[]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      executeCommand(currentInput);
      setCurrentInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex =
          historyIndex === -1
            ? history.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setCurrentInput("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(history[newIndex]);
        }
      }
    }
  };

  return (
    <div className="bg-mocha-base h-full w-full font-mono text-sm">
      <div
        ref={terminalRef}
        className="bg-mocha-base rounded-b-lg p-4 h-full overflow-y-auto"
        onClick={() => document.getElementById("hiddenInput")?.focus()}
      >
        {output.map((line, index) => (
          <div key={index} className="mb-1">
            {line.type === "command" ? (
              <div>
                <div className="flex items-start">
                  <span className="text-mocha-text">┬─[</span>
                  <span className="text-mocha-green">{username}</span>
                  <span className="text-mocha-text">@</span>
                  <span className="text-mocha-blue">{hostname}</span>
                  <span className="text-mocha-text">:</span>
                  <span className="text-mocha-yellow">{line.path}</span>
                  <span className="text-mocha-text">]─[</span>
                  <span className="text-mocha-mauve">{line.time}</span>
                  <span className="text-mocha-text">]</span>
                </div>
                <div className="flex items-center">
                  <span className="text-mocha-text">╰─{">"}</span>
                  <span className="text-mocha-green">$ </span>
                  <span className="text-mocha-text">{line.content}</span>
                </div>
              </div>
            ) : (
              <div className={line.color} style={{ whiteSpace: "pre-line" }}>
                {line.content}
              </div>
            )}
          </div>
        ))}

        {/* Current Input Line */}
        <div className="flex flex-col">
          <div className="flex items-start">
            <span className="text-mocha-text">┬─[</span>
            <span className="text-mocha-green">{username}</span>
            <span className="text-mocha-text">@</span>
            <span className="text-mocha-blue">{hostname}</span>
            <span className="text-mocha-text">:</span>
            <span className="text-mocha-yellow">{getShortPath()}</span>
            <span className="text-mocha-text">]─[</span>
            <span className="text-mocha-mauve">{getCurrentTime()}</span>
            <span className="text-mocha-text">]</span>
          </div>
          <div className="flex items-center">
            <span className="text-mocha-text">╰─{">"}</span>
            <span className="text-mocha-green">$ </span>
            <span className="text-mocha-text">{currentInput}</span>
            <span className="text-mocha-text animate-pulse">█</span>
          </div>
        </div>
      </div>

      {/* Hidden input for capturing keyboard events */}
      <input
        id="hiddenInput"
        className="absolute -left-full opacity-0"
        value={currentInput}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setCurrentInput(e.target.value)
        }
        onKeyDown={handleKeyDown}
        autoFocus
      />
    </div>
  );
}
