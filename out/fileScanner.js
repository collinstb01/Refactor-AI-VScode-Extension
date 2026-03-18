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
exports.scanWorkspace = scanWorkspace;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const IGNORE_DIRS = ["node_modules", ".git", "dist", "build", ".next", "pycache", "__pycache__"];
const ALLOWED_EXTENSIONS = [".js", ".ts", ".tsx", ".py", ".go", ".rs", ".java"];
const MAX_FILE_SIZE = 100 * 1024; // 100kb
async function scanWorkspace() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        throw new Error("No workspace folder open. Open a project directory to use Refactor AI.");
    }
    const files = [];
    const rootPath = workspaceFolders[0].uri.fsPath;
    async function walkDirectory(dir) {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(rootPath, fullPath);
            if (entry.isDirectory()) {
                if (IGNORE_DIRS.includes(entry.name)) {
                    continue;
                }
                // Recursively walk ignored directories
                await walkDirectory(fullPath);
            }
            else if (entry.isFile()) {
                const extension = path.extname(entry.name);
                // Only capture allowed file extensions
                if (!ALLOWED_EXTENSIONS.includes(extension)) {
                    continue;
                }
                // Check file size limit
                const stats = await fs.promises.stat(fullPath);
                if (stats.size > MAX_FILE_SIZE) {
                    console.log(`[Scanner] Skipped ${relativePath} — exceeds 100kb limit.`);
                    continue;
                }
                const content = await fs.promises.readFile(fullPath, 'utf8');
                // Avoid empty files
                if (content.trim().length > 0) {
                    files.push({
                        path: relativePath,
                        content
                    });
                }
            }
        }
    }
    await walkDirectory(rootPath);
    return files;
}
//# sourceMappingURL=fileScanner.js.map