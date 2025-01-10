import { useState, useEffect, StrictMode } from "react";
import { App, Modal, TFile } from "obsidian";
import { createRoot, Root } from "react-dom/client";

type MOCFile = {
  file: TFile;
  tags: string[];
  selected: boolean;
};

type ReactModalProps = {
  files: MOCFile[];
  onSelect: (selectedFiles: MOCFile[]) => void;
  onClose: () => void;
};

export class BindModal extends Modal {
  root: Root | null = null;

  constructor(app: App, public props: ReactModalProps) {
    super(app);
  }

  async onOpen() {
    this.root = createRoot(this.contentEl.createDiv());
    this.root.render(
      <StrictMode>
        <ReactModal {...this.props} />
      </StrictMode>
    );
  }

  async onClose() {
    this.root?.unmount();
  }
}

function ReactModal({ files, onSelect, onClose }: ReactModalProps) {
  const [filter, setFilter] = useState("");
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "k":
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowDown":
        case "j":
          setSelectedIndex((prev) =>
            Math.min(filteredFiles.length - 1, prev + 1)
          );
          break;
        case " ":
          setFilteredFiles((prev) => {
            const newFiles = [...prev];
            newFiles[selectedIndex].selected =
              !newFiles[selectedIndex].selected;
            return newFiles;
          });
          break;
        case "Enter":
          onSelect(filteredFiles.filter((f) => f.selected));
          break;
        case "Escape":
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredFiles, selectedIndex, onSelect, onClose]);

  // Update filtered files when filter changes
  useEffect(() => {
    setFilteredFiles(
      files.filter((f) =>
        f.file.name.toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [filter, files]);

  return (
    <div className="moc-modal">
      <input
        type="text"
        placeholder="Filter MOC files..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        autoFocus
      />
      <div className="moc-list">
        {filteredFiles.map((f, i) => (
          <div
            key={f.file.path}
            className={`moc-item ${i === selectedIndex ? "is-selected" : ""}`}
          >
            <input
              type="checkbox"
              checked={f.selected}
              onChange={() => {
                const newFiles = [...filteredFiles];
                newFiles[i].selected = !newFiles[i].selected;
                setFilteredFiles(newFiles);
              }}
            />
            <span>{f.file.name}</span>
            <div className="tags">
              {f.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
