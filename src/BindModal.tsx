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
  const [searchWord, setSearchWord] = useState("");
  const [selectedFiles, setSelectedFiles] = useState(files);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowUp":
          setHighlightedIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowDown":
          setHighlightedIndex((prev) =>
            Math.min(selectedFiles.length - 1, prev + 1)
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
  }, [selectedFiles]);

  // Update filtered files when filter changes
  useEffect(() => {
    setSelectedFiles(
      files.filter((f) =>
        f.file.name.toLowerCase().includes(searchWord.toLowerCase())
      )
    );
    setHighlightedIndex(0);
  }, [searchWord, files]);

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
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          autoFocus
          style={{
            width: "100%",
            backgroundColor: "var(--background-primary)",
          }}
        />
      </div>
      <div className="moc-list">
        {selectedFiles.map((f, i) => (
          <div
            key={f.file.path}
            className={`moc-item ${
              i === highlightedIndex ? "is-selected" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selectedFiles[i].selected}
              ref={i === highlightedIndex ? inputRef : null}
              onChange={() => {
                const newFiles = [...selectedFiles];
                // ここで元ファイルのselectedを参照しているため、mutationが発生している
                newFiles[i].selected = !newFiles[i].selected;
                setSelectedFiles(newFiles);
              }}
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
