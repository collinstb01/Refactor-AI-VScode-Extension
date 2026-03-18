import axios from 'axios';
import { ScannedFile } from './fileScanner';

const API_ENDPOINT = "https://refactorai-production.up.railway.app/analyze/vscode";

export async function analyzeWorkspace(files: ScannedFile[]): Promise<any> {
    try {
        const payload = {
            files: files
        };

        const response = await axios.post(
            API_ENDPOINT,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                // Depending on the codebase size, the LLM may take a decent amount of time to analyze
                timeout: 300000
            }
        );

        return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const message = error.response.data?.detail || error.response.statusText;
                throw new Error(`API rejected request (${error.response.status}): ${message}`);
            }
            throw new Error(`Timeout or Network failure connecting to Refactor AI backend.`);
        }

        throw new Error(`Unknown analysis error: ${error.message}`);
    }
}
