import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  getFrontMatterInfo,
} from "obsidian";
import { BindModal } from "./BindModal";

type MOCFile = {
  file: TFile;
  tags: string[];
  selected: boolean;
};

type MOCModalBinderSettings = {
  autoBind: boolean;
};

const DEFAULT_SETTINGS: MOCModalBinderSettings = {
  autoBind: true,
};

export default class MOCModalBinder extends Plugin {
  settings: MOCModalBinderSettings;

  async onload() {
    await this.loadSettings();

    // Register command to open MOC selection modal
    this.addCommand({
      id: "open-moc-selector",
      name: "Open MOC Selector",
      callback: () => {
        this.openMOCSelector();
      },
    });

    this.addCommand({
      id: "test",
      name: "Test",
      callback: async () => {
        console.log("Test");
        // const mocFiles = this.app.vault.getMarkdownFiles().filter((f) => {
        //   const cache = this.app.metadataCache.getFileCache(f);
        //   return cache?.frontmatter?.tags?.includes("MOC");
        // });
        // const file = this.app.metadataCache.getFileCache(mocFiles[0]);
        // const content = await this.app.vault.read(mocFiles[0]);
        // const info = getFrontMatterInfo(content);
        // console.log(file, info);
        // const contentStart = info.contentStart;
        // const modifiedContent =
        //   content.slice(0, contentStart) +
        //   "hello world\n" +
        //   content.slice(contentStart);
        // console.log(modifiedContent);
        // await this.app.vault.modify(mocFiles[0], modifiedContent);

        // Untitled 6 という名前のファイルを検索し、TFile オブジェクトを取得
        const file = this.app.vault
          .getMarkdownFiles()
          .find((f) => f.basename === "Untitled 6");
        if (!file) return;
        await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
          // frontmatter.tags = ["test"];
          delete frontmatter.tags;
        });
      },
    });

    // Register file creation event handler if autoBind is enabled
    if (this.settings.autoBind) {
      this.registerEvent(
        this.app.vault.on("create", (file) => {
          if (file instanceof TFile) {
            this.openMOCSelector(file);
          }
        })
      );
    }

    // Add settings tab
    this.addSettingTab(new MOCModalBinderSettingTab(this.app, this));
  }

  async openMOCSelector(file?: TFile) {
    // Get all files with MOC tag
    const mocFiles = this.app.vault.getMarkdownFiles().filter((f) => {
      const cache = this.app.metadataCache.getFileCache(f);
      return cache?.frontmatter?.tags?.includes("MOC");
    });

    if (mocFiles.length === 0) {
      console.warn("No MOC files found");
      return;
    }

    // Map to MOCFile format
    const mappedFiles: MOCFile[] = mocFiles.map((f) => {
      const cache = this.app.metadataCache.getFileCache(f);
      return {
        file: f,
        tags:
          cache?.frontmatter?.tags?.filter((t: string) => t !== "MOC") || [],
        selected: false,
      };
    });

    new BindModal(this.app, {
      files: mappedFiles,
      onSelect: async (selectedFiles) => {
        if (!file || selectedFiles.length === 0) return;

        // Add link to selected MOC files
        for (const mocFile of selectedFiles) {
          await this.app.vault.process(mocFile.file, (data) => {
            if (!data.includes(`[[${file.basename}]]`)) {
              return data + `\n- [[${file.basename}]]`;
            }
            return data;
          });
        }

        // Add tags to new file
        const allTags = selectedFiles.flatMap((f) => f.tags);
        const uniqueTags = [...new Set(allTags)];
        if (uniqueTags.length > 0) {
          await this.app.vault.process(file, (data) => {
            // Check if frontmatter already exists
            const hasFrontmatter = data.startsWith("---");
            const frontmatter = `---\ntags: [${uniqueTags
              .map((t) => `"${t}"`)
              .join(", ")}]\n---\n`;
            return hasFrontmatter
              ? data.replace(/^---\n([\s\S]*?\n)---\n/, frontmatter)
              : frontmatter + data;
          });
        }
      },
      onClose: () => {
        if (!file) return;
        this.app.workspace.getLeaf().openFile(file);
      },
    }).open();
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class MOCModalBinderSettingTab extends PluginSettingTab {
  plugin: MOCModalBinder;

  constructor(app: App, plugin: MOCModalBinder) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Auto Bind")
      .setDesc("Automatically show MOC selector when creating new files")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoBind)
          .onChange(async (value) => {
            this.plugin.settings.autoBind = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
