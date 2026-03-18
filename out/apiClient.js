"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWorkspace = analyzeWorkspace;
const axios_1 = __importDefault(require("axios"));
const API_ENDPOINT = "https://refactorai-production.up.railway.app/analyze/vscode";
async function analyzeWorkspace(files) {
    try {
        const payload = {
            files: files
        };
        const response = await axios_1.default.post(API_ENDPOINT, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            // Depending on the codebase size, the LLM may take a decent amount of time to analyze
            timeout: 300000
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            if (error.response) {
                const message = error.response.data?.detail || error.response.statusText;
                throw new Error(`API rejected request (${error.response.status}): ${message}`);
            }
            throw new Error(`Timeout or Network failure connecting to Refactor AI backend.`);
        }
        throw new Error(`Unknown analysis error: ${error.message}`);
    }
}
//# sourceMappingURL=apiClient.js.map