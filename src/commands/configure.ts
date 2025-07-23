import * as vscode from 'vscode';

export async function configureApiKey() {
    const config = vscode.workspace.getConfiguration('gitresume');
    const currentKey = config.get<string>('openaiApiKey');
    
    const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your OpenAI API key',
        placeHolder: 'sk-...',
        value: currentKey,
        password: true,
        validateInput: (value) => {
            if (!value) {
                return 'API key is required';
            }

            return null;
        }
    });

    if (apiKey) {
        await config.update('openaiApiKey', apiKey, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('API key saved successfully!');
    }
}