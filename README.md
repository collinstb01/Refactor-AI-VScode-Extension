# Refactor AI VSCode Extension

AI-powered workspace analyzer for VS Code.

## What it does
- Scans workspace for source files (`.js`, `.ts`, `.tsx`, `.py`, `.go`, `.rs`, `.java`) under 100kb
- Ignores `node_modules`, `.git`, `dist`, `build`, `.next`, and cache directories
- Sends code snapshot to remote AI backend
- Receives structured analysis (score, summary, issues, suggestions)
- Generates `refactor-ai-report.md` in workspace and opens it

## Setup
1. clone repo
2. npm install
3. npm run compile

## Usage
1. Open workspace in VS Code
2. Run command: `Refactor AI: Analyze Workspace`
3. Wait for analysis and inspect `refactor-ai-report.md`

## Configuration
- API endpoint is in `src/apiClient.ts` (`API_ENDPOINT`).

## Development
- `npm run watch` for development mode
- `npm run compile` to build

## Files
- `src/extension.ts` command workflow
- `src/fileScanner.ts` workspace scan logic
- `src/apiClient.ts` API request + error handling
- `src/reportGenerator.ts` report generation
