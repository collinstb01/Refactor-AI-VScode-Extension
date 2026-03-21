import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function generateReport(data: any): Promise<void> {
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
    } else {
        // Group issues by file path for organized report
        const groupedIssues: Record<string, any[]> = {};
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
    } catch (err) {
        console.warn('Could not auto-open generated file pane.', err);
    }
}
