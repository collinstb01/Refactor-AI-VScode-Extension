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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fileScanner_1 = require("./fileScanner");
const apiClient_1 = require("./apiClient");
const reportGenerator_1 = require("./reportGenerator");
let statusBarItem;
function activate(context) {
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
        }
        catch (error) {
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
        const files = await (0, fileScanner_1.scanWorkspace)();
        if (files.length === 0) {
            vscode.window.showInformationMessage("No applicable source files found to analyze.");
            return;
        }
        // 2. Transmit to API
        progress.report({ message: `Sending ${files.length} files to backend...` });
        // Let the user see the "Sending" step briefly before Analysis starts
        await new Promise(resolve => setTimeout(resolve, 500));
        progress.report({ message: "Analyzing code..." });
        const results = await (0, apiClient_1.analyzeWorkspace)(files);
        // 3. Generate Markdown Report
        progress.report({ message: "Writing report..." });
        await (0, reportGenerator_1.generateReport)(results);
        vscode.window.showInformationMessage("Refactor AI analysis complete!");
    });
}
function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
//# sourceMappingURL=extension.js.map