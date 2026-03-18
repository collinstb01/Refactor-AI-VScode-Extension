"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = generateReport;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function generateReport(data) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return; // Nothing to do
    }
    const rootPath = workspaceFolders[0].uri.fsPath;
    const reportPath = path.join(rootPath, 'refactor-ai-report.md');
    // Parse the standardized API structure
    const score = data.score !== undefined ? data.score : "N/A";
    const summary = data.summary || "No AI summary was provided by the backend.";
    const issues = data.issues || [];
    const suggestions = data.suggestions || [];
    // Format Markdown file
    let markdown = `# Refactor AI Report\n\n`;
    // Core details
    markdown += `## Architecture Score\n**${score}**\n\n`;
    markdown += `## Summary\n${summary}\n\n`;
    // Process Issues
    markdown += `## Issues & Vulnerabilities\n`;
    if (issues.length === 0) {
        markdown += `No critical issues found! 🎉\n\n`;
    }
    else {
        // Automatically group identical code flaws by their root filepath
        const groupedIssues = {};
        for (const issue of issues) {
            const file = issue.file_path || "Unknown File Context";
            if (!groupedIssues[file]) {
                groupedIssues[file] = [];
            }
            groupedIssues[file].push(issue);
        }
        for (const [file, items] of Object.entries(groupedIssues)) {
            markdown += `- **\`${file}\`**\n`;
            for (const item of items) {
                const badge = item.severity ? `[\`${item.severity.toUpperCase()}\`] ` : '';
                markdown += `  - ${badge}${item.description || item.type || "?"}\n`;
                if (item.suggestion) {
                    markdown += `    - *Fix Idea*: ${item.suggestion}\n`;
                }
            }
        }
        markdown += `\n`;
    }
    // Process Refactor Suggestions
    if (suggestions.length > 0) {
        markdown += `## Refactor Ideas\n`;
        for (const config of suggestions) {
            markdown += `- **${config.title}** (${config.impact} impact)  \n`;
            markdown += `  ${config.description}\n`;
        }
        markdown += `\n`;
    }
    // Write file directly into workspace directory natively
    await fs.promises.writeFile(reportPath, markdown, 'utf8');
    // Open file to display to user automatically
    try {
        const doc = await vscode.workspace.openTextDocument(reportPath);
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    }
    catch (err) {
        console.warn('Could not auto-open generated file pane.', err);
    }
}
//# sourceMappingURL=reportGenerator.js.map