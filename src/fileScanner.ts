import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface ScannedFile {
    path: string;
    content: string;
}

const IGNORE_DIRS = ["node_modules", ".git", "dist", "build", ".next", "pycache", "__pycache__"];
const ALLOWED_EXTENSIONS = [".js", ".ts", ".tsx", ".py", ".go", ".rs", ".java"];
const MAX_FILE_SIZE = 100 * 1024; // 100kb

export async function scanWorkspace(): Promise<ScannedFile[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        throw new Error("No workspace folder open. Open a project directory to use Refactor AI.");
    }

    const files: ScannedFile[] = [];
    const rootPath = workspaceFolders[0].uri.fsPath;

    async function walkDirectory(dir: string) {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(rootPath, fullPath);

            if (entry.isDirectory()) {
                if (IGNORE_DIRS.includes(entry.name)) {
                    continue;
                }

                // Recursively walk subdirectories
                await walkDirectory(fullPath);
            } else if (entry.isFile()) {
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

