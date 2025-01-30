import { useState, useEffect, StrictMode, useRef } from "react";
import { App, Modal, TFile } from "obsidian";
import { createRoot, Root } from "react-dom/client";

export type MOCFile = {
  file: TFile;
  tags: string[];
  selected: boolean;
};

type ReactModalProps = {
  files: MOCFile[];
  onSelect: () => void;
  close: () => void;
  targetFilename: string;
};

export class BindModal extends Modal {
  root: Root | null = null;

  constructor(app: App, public props: Omit<ReactModalProps, "close">) {
    super(app);
  }

  async onOpen() {
    this.root = createRoot(this.contentEl.createDiv());
    this.root.render(
      <StrictMode>
        <ReactModal {...this.props} close={() => this.close()} />
      </StrictMode>
    );
  }

  async onClose() {
    this.root?.unmount();
  }
}

function ReactModal({
  files,
  onSelect,
  close,
  targetFilename,
}: ReactModalProps) {
  const [mocFiles, setMOCFiles] = useState<MOCFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 選択されているファイルを取得
  const selectedMOCs = files.filter((f) => f.selected);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowUp":
          setHighlightedIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowDown":
          setHighlightedIndex((prev) =>
            Math.min(filteredFiles.length - 1, prev + 1)
          );
          break;
        case "Enter":
          // Ctrl + Enter
          if (e.ctrlKey) {
            onSelect();
            close();
          } else {
            inputRef.current?.click();
          }
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredFiles]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilteredFiles(
      files.filter((f) =>
        f.file.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
    setHighlightedIndex(0);
  }

  // 選択解除用の関数を追加
  function handleUnselectMOC(filePath: string) {
    const newFiles = filteredFiles.map((f) =>
      f.file.path === filePath ? { ...f, selected: false } : f
    );
    setFilteredFiles(newFiles);
  }

  return (
    <div className="moc-modal">
      <div
        style={{
          paddingTop: "8px",
          paddingBottom: "8px",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            marginBottom: "8px",
            color: "var(--text-normal)",
            textAlign: "center",
          }}
        >
          Select MOCs to backlink for:
          <span style={{ fontWeight: "bold" }}> {targetFilename} </span>
        </div>
        <input
          type="text"
          placeholder="Filter MOC files..."
          onChange={(e) => handleSearchChange(e)}
          autoFocus
          style={{
            width: "100%",
            backgroundColor: "var(--background-primary)",
            marginBottom: selectedMOCs.length > 0 ? "8px" : "0",
          }}
        />
        {selectedMOCs.length > 0 && (
          <div
            style={{
              marginBottom: "8px",
              padding: "8px",
              backgroundColor: "var(--background-secondary)",
              borderRadius: "4px",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {selectedMOCs.map((f) => (
                <div
                  key={f.file.path}
                  style={{
                    backgroundColor: "var(--background-modifier-success)",
                    padding: "2px 6px",
                    paddingRight: "2px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>{f.file.name.replace(/\.md$/, "")}</span>
                  <button
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: "2px 4px",
                      cursor: "pointer",
                      borderRadius: "2px",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "10px",
                    }}
                    onClick={(e) => {
                      handleUnselectMOC(f.file.path);
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--background-modifier-error)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="moc-list">
        {filteredFiles.map((f, i) => (
          <div
            key={f.file.path}
            className={`moc-item ${
              i === highlightedIndex ? "is-selected" : ""
            }`}
            onClick={() => {
              const newFiles = [...filteredFiles];
              // ここで元ファイルのselectedを参照しているため、mutationが発生している
              newFiles[i].selected = !newFiles[i].selected;
              setFilteredFiles(newFiles);
            }}
            style={{ cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={filteredFiles[i].selected}
              ref={i === highlightedIndex ? inputRef : null}
            />
            <span>{f.file.name.replace(/\.md$/, "")}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          borderTop: "1px solid var(--background-modifier-border)",
          paddingTop: "8px",
          marginTop: "8px",
          fontSize: "12px",
          color: "var(--text-muted)",
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <span>
          <strong>↓↑</strong> navigate
        </span>
        <span>
          <strong>↵</strong> select toggle
        </span>
        <span>
          <strong>Ctrl + ↵</strong> apply
        </span>
        <span>
          <strong>Esc</strong> close
        </span>
      </div>
    </div>
  );
}
