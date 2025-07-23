import * as vscode from 'vscode';
import * as path from 'path';
import { GitAnalyzer } from '../services/gitAnalyzer';
import { ResumeGenerator } from '../services/resumeGenerator';
import { OutputFormatter } from '../utils/outputFormatter';

export async function generateResume(context: vscode.ExtensionContext) {
    // Check workspace
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('Please open a Git repository folder');
        return;
    }

    // Check API key
    const config = vscode.workspace.getConfiguration('gitresume');
    const apiKey = config.get<string>('openaiApiKey');
    if (!apiKey) {
        const action = await vscode.window.showErrorMessage(
            'OpenAI API key not configured',
            'Configure'
        );
        if (action === 'Configure') {
            vscode.commands.executeCommand('gitresume.configure');
        }
        return;
    }

    try {
        // Get user email
        const gitAnalyzer = new GitAnalyzer(workspaceFolder.uri.fsPath);
        const gitEmail = await gitAnalyzer.getUserEmail();
        
        let userEmail: string | undefined;
        if (gitEmail) {
            const useGit = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: `Use Git email: ${gitEmail}?`
            });
            userEmail = useGit === 'Yes' ? gitEmail : undefined;
        }
        
        if (!userEmail) {
            userEmail = await vscode.window.showInputBox({
                prompt: 'Enter your Git email',
                placeHolder: 'your.email@example.com',
                validateInput: (value) => {
                    return value.includes('@') ? null : 'Enter a valid email';
                }
            });
        }

        if (!userEmail) {
            return;
        }

        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'GitResume',
            cancellable: true
        }, async (progress, token) => {
            // Step 1: Analyze repository
            progress.report({ message: 'Analyzing Git history...', increment: 20 });
            
            // Step 2: Extract code snippets
            progress.report({ message: 'Extracting code changes...', increment: 30 });
            
            const snippets = await gitAnalyzer.extractCodeSnippets(
                config.get<string[]>('includePatterns') || ['**/*.{js,ts,py,java,go}'],
                config.get<string[]>('excludePatterns') || ['**/node_modules/**']
            );

            if (token.isCancellationRequested) {
                return;
            }

            // Step 3: Generate resume bullets
            progress.report({ message: 'Generating resume points with AI...', increment: 30 });
            
            const generator = new ResumeGenerator(apiKey);
            const bullets = await generator.generateBullets(
                snippets,
                config.get<string>('style') || 'professional',
                config.get<number>('maxBullets') || 10
            );

            // Step 4: Display results
            progress.report({ message: 'Formatting results...', increment: 20 });
            
            const formatter = new OutputFormatter();
            const output = formatter.formatBullets(bullets);
            
            // Create output channel
            const outputChannel = vscode.window.createOutputChannel('GitResume Results');
            outputChannel.clear();
            outputChannel.appendLine('=== GitResume - Generated Resume Points ===\n');
            outputChannel.appendLine(output);
            outputChannel.show();

            // Offer to copy
            const action = await vscode.window.showInformationMessage(
                `Generated ${bullets.length} resume points!`,
                'Copy All',
                'Save to File'
            );

            if (action === 'Copy All') {
                await vscode.env.clipboard.writeText(output);
                vscode.window.showInformationMessage('Copied to clipboard!');
            } else if (action === 'Save to File') {
                const uri = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(path.join(workspaceFolder.uri.fsPath, 'resume-points.md')),
                    filters: {
                        'Markdown': ['md'],
                        'Text': ['txt']
                    }
                });
                
                if (uri) {
                    await vscode.workspace.fs.writeFile(uri, Buffer.from(output));
                    vscode.window.showInformationMessage(`Saved to ${uri.fsPath}`);
                }
            }
        });

    } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
        console.error('GitResume error:', error);
    }
}