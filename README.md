# MOC Modal Binder - Obsidian Plugin

A plugin for Obsidian that helps you organize your notes by automatically linking new files to MOC (Map of Content) files and inheriting tags.

## Features

- **MOC File Selection**: When creating a new file, a modal appears allowing you to select which MOC files to link to
- **Tag Inheritance**: Automatically inherits tags from selected MOC files
- **Auto Linking**: Creates backlinks from selected MOC files to the new file
- **Keyboard Navigation**: 
  - Use arrow keys (↑↓) to navigate
  - Press Enter to toggle selection
  - Ctrl+Enter to apply selection
  - Esc to close modal
- **Search Filter**: Quickly find MOC files by name
- **Auto Bind Setting**: Option to automatically show modal when creating new files

## Installation

1. Go to Settings → Community plugins
2. Disable Safe Mode (if enabled)
3. Browse community plugins and search for "MOC Modal Binder"
4. Install and enable the plugin

## Usage

1. **For new files**:
   - Create a new file
   - Select MOC files to link to in the modal
   - The new file will:
     - Be linked from selected MOC files
     - Inherit tags from selected MOC files (excluding the MOC tag itself)

2. **For existing files**:
   - Use the "Open MOC Selector" command from the command palette
   - Select MOC files to link to the currently active file

## Settings

- **Auto Bind**: Toggle whether the modal appears automatically when creating new files
  - Can be toggled via command palette or settings tab

## License

MIT
