import * as simpleGit from 'simple-git';
import { minimatch } from 'minimatch';
import * as path from 'path';

export interface GitCommit {
    hash: string;
    message: string;
    author: string;
    email: string;
    date: Date;
}

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

    async getUserCommits(email: string, limit: number = 100): Promise<GitCommit[]> {
        const log = await this.git.log({
            '--author': email,
            '--max-count': limit
        });

        return log.all.map(commit => ({
            hash: commit.hash,
            message: commit.message,
            author: commit.author_name,
            email: commit.author_email,
            date: new Date(commit.date)
        }));
    }

    async extractCodeSnippets(
        email: string,
        includePatterns: string[],
        excludePatterns: string[]
    ): Promise<CodeSnippet[]> {
        const commits = await this.getUserCommits(email, 50);
        const snippets: CodeSnippet[] = [];
        const processedFiles = new Set<string>();

        for (const commit of commits) {
            try {
                // Get changed files in commit
                const diff = await this.git.diffSummary([`${commit.hash}^`, commit.hash]);
                
                for (const file of diff.files) {
                    // Skip if already processed or doesn't match patterns
                    if (processedFiles.has(file.file)) continue;
                    if (!this.shouldIncludeFile(file.file, includePatterns, excludePatterns)) continue;
                    
                    processedFiles.add(file.file);

                    // Get file content at this commit
                    try {
                        const content = await this.git.show([`${commit.hash}:${file.file}`]);
                        
                        // Limit content size
                        const snippet = content.substring(0, 1000);
                        
                        snippets.push({
                            content: snippet,
                            filePath: file.file,
                            language: this.detectLanguage(file.file),
                            commitMessage: commit.message,
                            additions: 'insertions' in file ? (file as simpleGit.DiffResultTextFile).insertions : 0,
                            deletions: 'deletions' in file ? (file as simpleGit.DiffResultTextFile).deletions : 0
                        });
                    } catch {
                        // File might not exist at this commit
                        continue;
                    }
                }
            } catch (error) {
                console.error(`Error processing commit ${commit.hash}:`, error);
            }
        }

        return snippets.slice(0, 20); // Limit total snippets
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
            '.scala': 'scala'
        };
        return langMap[ext] || 'text';
    }
}