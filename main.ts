import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
} from "obsidian";

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
    // TODO: Implement modal opening logic
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
