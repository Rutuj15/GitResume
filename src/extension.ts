import * as vscode from 'vscode';
import { generateResume } from './commands/generateResume';
import { configureApiKey } from './commands/configure';

export function activate(context: vscode.ExtensionContext) {
    console.log('GitResume extension is now active!');

    // Register commands
    let generateCommand = vscode.commands.registerCommand('gitresume.generate', () => {
        generateResume(context);
    });

    let configureCommand = vscode.commands.registerCommand('gitresume.configure', () => {
        configureApiKey();
    });

    context.subscriptions.push(generateCommand);
    context.subscriptions.push(configureCommand);

    // Show welcome message on first activation
    const hasShownWelcome = context.globalState.get('gitresume.welcomed');
    if (!hasShownWelcome) {
        const message = 'Welcome to GitResume! Configure your OpenAI API key to get started.';
        vscode.window.showInformationMessage(message, 'Configure').then(selection => {
            if (selection === 'Configure') {
                vscode.commands.executeCommand('gitresume.configure');
            }
        });
        context.globalState.update('gitresume.welcomed', true);
    }
}

export function deactivate() {}