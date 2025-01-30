import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  Notice,
} from "obsidian";
import { BindModal, MOCFile } from "./BindModal";
import { insertLink } from "./insertLink";

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
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          this.openMOCSelector(activeFile);
        }
      },
    });

    // Register file creation event handler if autoBind is enabled
    this.registerEvent(
      this.app.vault.on("create", (file) => {
        if (file instanceof TFile && this.settings.autoBind === true) {
          this.openMOCSelector(file);
        }
      })
    );

    // Add settings tab
    this.addSettingTab(new MOCModalBinderSettingTab(this.app, this));
  }

  async openMOCSelector(file: TFile) {
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
      onSelect: async () => {
        const selectedFiles = mappedFiles.filter((f) => f.selected);
        // Add link to selected MOC files
        for (const mocFile of selectedFiles) {
          await insertLink(mocFile.file, file);
        }
        // Add tags to new file
        const allTags = selectedFiles.flatMap((f) => f.tags);

        await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
          const currentTags = frontmatter.tags || [];
          const uniqueTags = [...new Set([...currentTags, ...allTags])];
          frontmatter.tags = uniqueTags;
        });
      },
      targetFilename: file.basename,
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
      .setDesc("Automatically show MOC selector modal when creating new files")
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
