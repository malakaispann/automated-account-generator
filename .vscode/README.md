# VS Code Setup

## Required Extension

This project uses the **Run on Save** extension to automatically run the biome formatter when files are saved.

### Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "Run on Save" by emeraldwalk
4. Click Install

## How it Works

The extension is configured in `settings.json` to automatically run `bun run format` whenever you save JavaScript, TypeScript, JSON, CSS, HTML, or Markdown files.

## Manual Formatting

If you need to format files manually, you can run:

```bash
bun run format
```
