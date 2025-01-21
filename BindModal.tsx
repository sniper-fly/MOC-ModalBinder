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

function ReactModal({ files, onSelect }: ReactModalProps) {
  const [searchWord, setSearchWord] = useState("");
  const [selectedFiles, setSelectedFiles] = useState(files);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowDown":
          setSelectedIndex((prev) =>
            Math.min(selectedFiles.length - 1, prev + 1)
          );
          break;
        case "Enter":
          // Ctrl + Enter
          if (e.ctrlKey) {
            onSelect(selectedFiles.filter((f) => f.selected));
          } else {
            setSelectedFiles((prev) => {
              const newFiles = [...prev];
              newFiles[selectedIndex].selected =
                !newFiles[selectedIndex].selected;
              return newFiles;
            });
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update filtered files when filter changes
  useEffect(() => {
    setSelectedFiles(
      files.filter((f) =>
        f.file.name.toLowerCase().includes(searchWord.toLowerCase())
      )
    );
  }, [searchWord, files]);

  return (
    <div className="moc-modal">
      <input
        type="text"
        placeholder="Filter MOC files..."
        value={searchWord}
        onChange={(e) => setSearchWord(e.target.value)}
        autoFocus
      />
      <div className="moc-list">
        {selectedFiles.map((f, i) => (
          <div
            key={f.file.path}
            className={`moc-item ${i === selectedIndex ? "is-selected" : ""}`}
          >
            <input
              type="checkbox"
              checked={selectedFiles[i].selected}
              onChange={() => {
                const newFiles = [...selectedFiles];
                newFiles[i].selected = !newFiles[i].selected;
                setSelectedFiles(newFiles);
              }}
            />
            <span>{f.file.name}</span>
            {/* <div className="tags">
              {f.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}
