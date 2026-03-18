import * as vscode from 'vscode';
import { scanWorkspace } from './fileScanner';
import { analyzeWorkspace } from './apiClient';
import { generateReport } from './reportGenerator';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    console.log('Refactor AI Extension is now active!');

    // Initialize Status Bar Button
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(sparkle) Refactor AI';
    statusBarItem.command = 'refactorAi.analyzeWorkspace';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register Command Palette Action
    let disposable = vscode.commands.registerCommand('refactorAi.analyzeWorkspace', async () => {
        try {
            await runAnalysisCommand();
        } catch (error: any) {
            vscode.window.showErrorMessage(`Refactor AI Error: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

async function runAnalysisCommand() {
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Refactor AI",
        cancellable: false
    }, async (progress) => {

        // 1. Scan the Workspace
        progress.report({ message: "Scanning workspace..." });
        const files = await scanWorkspace();

        if (files.length === 0) {
            vscode.window.showInformationMessage("No applicable source files found to analyze.");
            return;
        }

        // 2. Transmit to API
        progress.report({ message: `Sending ${files.length} filed to backend...` });

        // Let the user see the "Sending" step briefly before Analysis starts
        await new Promise(resolve => setTimeout(resolve, 500));

        progress.report({ message: "Analyzing code..." });

        const results = await analyzeWorkspace(files);

        // 3. Generate Markdown Report
        progress.report({ message: "Writing report..." });
        await generateReport(results);

        vscode.window.showInformationMessage("Refactor AI analysis complete!");
    });
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
