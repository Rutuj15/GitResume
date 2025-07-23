import * as simpleGit from 'simple-git';
import { minimatch } from 'minimatch';
import * as path from 'path';
import * as fs from 'fs';

export interface CodeSnippet {
    content: string;
    filePath: string;
    language: string;
    commitMessage: string;
    additions: number;
    deletions: number;
}

export class GitAnalyzer {
    private git: simpleGit.SimpleGit;

    constructor(private repoPath: string) {
        this.git = simpleGit.simpleGit(repoPath);
    }

    async getUserEmail(): Promise<string | null> {
        try {
            const config = await this.git.getConfig('user.email');
            return config.value || null;
        } catch {
            return null;
        }
    }

    async extractCodeSnippets(
        includePatterns: string[],
        excludePatterns: string[]
    ): Promise<CodeSnippet[]> {
        const snippets: CodeSnippet[] = [];
        
        // Get latest commit message for context
        const latestCommit = await this.git.log({ maxCount: 1 });
        const commitMessage = latestCommit.latest?.message || 'Current codebase';

        // Get all tracked files
        const trackedFiles = await this.git.raw(['ls-files']);
        const fileList = trackedFiles.trim().split('\n').filter(Boolean);

        for (const filePath of fileList) {
            // Skip if doesn't match patterns
            if (!this.shouldIncludeFile(filePath, includePatterns, excludePatterns)) continue;
            
            try {
                // Read current file content
                const fullPath = path.join(this.repoPath, filePath);
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Limit content size for AI processing
                const snippet = content.substring(0, 2000);
                
                snippets.push({
                    content: snippet,
                    filePath: filePath,
                    language: this.detectLanguage(filePath),
                    commitMessage: commitMessage,
                    additions: 0, // Not applicable for current state
                    deletions: 0  // Not applicable for current state
                });
            } catch (error) {
                console.warn(`Could not read file ${filePath}:`, error);
                continue;
            }
        }

        return snippets.slice(0, 10); // Limit to top 10 files
    }

    private shouldIncludeFile(
        filePath: string,
        includePatterns: string[],
        excludePatterns: string[]
    ): boolean {
        // Check exclude patterns first
        for (const pattern of excludePatterns) {
            if (minimatch(filePath, pattern)) {
                return false;
            }
        }

        // Check include patterns
        for (const pattern of includePatterns) {
            if (minimatch(filePath, pattern)) {
                return true;
            }
        }

        return false;
    }

    private detectLanguage(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const langMap: { [key: string]: string } = {
            '.js': 'javascript',
            '.ts': 'typescript',
            '.py': 'python',
            '.java': 'java',
            '.go': 'go',
            '.rs': 'rust',
            '.cpp': 'cpp',
            '.c': 'c',
            '.cs': 'csharp',
            '.rb': 'ruby',
            '.php': 'php',
            '.swift': 'swift',
            '.kt': 'kotlin',
            '.scala': 'scala',
            '.html': 'html',
            '.css': 'css',
            '.scss': 'scss',
            '.jsx': 'javascript',
            '.tsx': 'typescript'
        };
        return langMap[ext] || 'text';
    }
}