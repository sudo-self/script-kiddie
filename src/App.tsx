import React, { useState, useCallback, useEffect } from "react";

const ScriptBuilder: React.FC = () => {
  const [scriptType, setScriptType] = useState<"sh" | "ps1">("sh");
  const [asciiArt, setAsciiArt] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [menuItems, setMenuItems] = useState<
    { label: string; command: string }[]
  >([]);
  const [newMenuItem, setNewMenuItem] = useState({ label: "", command: "" });
  const [selectedSnippet, setSelectedSnippet] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? "#1e1e1e" : "#ffffff";
  }, [isDarkMode]);

  const snippets = [
    { label: "Clear Screen", value: "clear" },
    { label: "List Directory", value: "ls -la" },
    { label: "Print Working Directory", value: "pwd" },
    { label: "Ping Google", value: "ping google.com" },
  ];

  const handleAddMenuItem = () => {
    if (!newMenuItem.label || !newMenuItem.command) return;
    setMenuItems((prev) => [...prev, newMenuItem]);
    setNewMenuItem({ label: "", command: "" });
  };

  const handleRemoveMenuItem = (index: number) => {
    setMenuItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInsertSnippet = () => {
    if (selectedSnippet) {
      setScriptContent((prev) => prev + `\n${selectedSnippet}`);
      setSelectedSnippet("");
    }
  };

  const escapeAsciiLine = (line: string) => {
    return line.replace(/(["`$])/g, "\\$1");
  };

  const generatePreview = useCallback(() => {
    let header = "";

    if (asciiArt.trim()) {
      const lines = asciiArt.trim().split("\n");
      if (scriptType === "sh") {
        header +=
          lines.map((line) => `echo "${escapeAsciiLine(line)}"`).join("\n") +
          "\n\n";
      } else {
        header +=
          lines
            .map((line) => `Write-Host "${line.replace(/"/g, '`"')}"`)
            .join("\n") + "\n\n";
      }
    }

    if (menuItems.length > 0) {
      if (scriptType === "sh") {
        header += `echo "Select an option:"\n`;
        menuItems.forEach((item, idx) => {
          header += `echo "${idx + 1}) ${item.label}"\n`;
        });
        header += `read -p "Choice: " choice\ncase $choice in\n`;
        menuItems.forEach((item, idx) => {
          header += `  ${idx + 1}) ${item.command} ;;\n`;
        });
        header += `  *) echo "Invalid option" ;;\nesac\n`;
      } else {
        header += `Write-Host "Select an option:"\n`;
        menuItems.forEach((item, idx) => {
          header += `Write-Host "${idx + 1}) ${item.label}"\n`;
        });
        header += `$choice = Read-Host "Choice"\nswitch ($choice) {\n`;
        menuItems.forEach((item, idx) => {
          header += `  "${idx + 1}" { ${item.command} }\n`;
        });
        header += `  default { Write-Host "Invalid option" }\n}\n`;
      }
    }

    setPreviewContent(`# Script Preview\n\n${header}${scriptContent}`);
  }, [asciiArt, scriptContent, menuItems, scriptType]);

  const handleExport = () => {
    const blob = new Blob([previewContent], {
      type: "text/plain;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = scriptType === "sh" ? "script.sh" : "script.ps1";
    link.click();
  };

  const styles = getStyles(isDarkMode);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🛠️ Script Builder</h1>

      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          alignSelf: "flex-end",
          background: "none",
          border: "none",
          fontSize: "24px",
          cursor: "pointer",
        }}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? "🌙" : "☀️"}
      </button>

      <Section title="Script Settings" dark={isDarkMode}>
        <div style={styles.row}>
          <select
            value={scriptType}
            onChange={(e) => setScriptType(e.target.value as "sh" | "ps1")}
            style={styles.select}
          >
            <option value="sh">bash shell (.sh)</option>
            <option value="ps1">Power Shell (.ps1)</option>
          </select>
        </div>
      </Section>

      <Section title="ASCII Art (optional)" dark={isDarkMode}>
        <textarea
          rows={5}
          placeholder="Paste your ASCII art here..."
          value={asciiArt}
          onChange={(e) => setAsciiArt(e.target.value)}
          style={styles.textarea}
        />
      </Section>

      <Section title="Common Snippets" dark={isDarkMode}>
        <div style={styles.row}>
          <select
            value={selectedSnippet}
            onChange={(e) => setSelectedSnippet(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Select a snippet --</option>
            {snippets.map((s, i) => (
              <option key={i} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button onClick={handleInsertSnippet} style={styles.button}>
            Insert
          </button>
        </div>
      </Section>

      <Section title="Script Content" dark={isDarkMode}>
        <textarea
          rows={10}
          placeholder="Write your script here..."
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          style={styles.textarea}
        />
      </Section>

      <Section title="Menu Builder" dark={isDarkMode}>
        <div style={styles.row}>
          <input
            type="text"
            placeholder="Label"
            value={newMenuItem.label}
            onChange={(e) =>
              setNewMenuItem({ ...newMenuItem, label: e.target.value })
            }
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Command"
            value={newMenuItem.command}
            onChange={(e) =>
              setNewMenuItem({ ...newMenuItem, command: e.target.value })
            }
            style={styles.input}
          />
          <button onClick={handleAddMenuItem} style={styles.button}>
            Add
          </button>
        </div>

        <ul style={{ paddingLeft: 0 }}>
          {menuItems.map((item, idx) => (
            <li key={idx} style={styles.listItem}>
              {item.label} — <code>{item.command}</code>
              <button
                onClick={() => handleRemoveMenuItem(idx)}
                style={styles.removeButton}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Actions" dark={isDarkMode}>
        <div style={styles.row}>
          <button onClick={generatePreview} style={styles.button}>
            Generate Preview
          </button>
          <button onClick={handleExport} style={styles.button}>
            Export Script
          </button>
        </div>
      </Section>

      <Section title="Script Preview" dark={isDarkMode}>
        <textarea
          readOnly
          value={previewContent}
          rows={20}
          style={styles.textarea}
        />
      </Section>
    </div>
  );
};

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}> = ({ title, children, dark = false }) => (
  <div style={getStyles(dark).card}>
    <h2>{title}</h2>
    {children}
  </div>
);

// === Styles ===
const getStyles = (dark: boolean): { [key: string]: React.CSSProperties } => ({
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    backgroundColor: dark ? "#1e1e1e" : "#f9f9f9",
    color: dark ? "#f5f5f5" : "#1a1a1a",
    minHeight: "100vh",
  },
  title: { textAlign: "center" },
  card: {
    background: dark ? "#2a2a2a" : "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  row: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  select: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    flex: 1,
    backgroundColor: dark ? "#444" : "#fff",
    color: dark ? "#fff" : "#000",
  },
  input: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    flex: 1,
    backgroundColor: dark ? "#444" : "#fff",
    color: dark ? "#fff" : "#000",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    fontFamily: "monospace",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: dark ? "#333" : "#fff",
    color: dark ? "#fff" : "#000",
  },
  button: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: dark ? "#3399ff" : "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  removeButton: {
    padding: "4px 8px",
    borderRadius: "6px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    marginLeft: "10px",
    cursor: "pointer",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "5px 0",
  },
});

export default ScriptBuilder;
