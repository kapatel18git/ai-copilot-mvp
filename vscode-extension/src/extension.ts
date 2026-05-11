import * as vscode from 'vscode';
import axios from 'axios';

let statusBar: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  console.log('AI Copilot extension activated');

  // Create status bar
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'aiCopilot.status';
  updateStatusBar();
  context.subscriptions.push(statusBar);

  // Register commands
  const commands = [
    { cmd: 'aiCopilot.complete', handler: completeCommand },
    { cmd: 'aiCopilot.explain', handler: explainCommand },
    { cmd: 'aiCopilot.fix', handler: fixCommand },
    { cmd: 'aiCopilot.test', handler: testCommand },
    { cmd: 'aiCopilot.docs', handler: docsCommand },
    { cmd: 'aiCopilot.status', handler: () => checkBackendHealth() },
  ];

  commands.forEach(({ cmd, handler }) => {
    context.subscriptions.push(vscode.commands.registerCommand(cmd, handler));
  });
}

async function getBackendUrl(): Promise<string> {
  const config = vscode.workspace.getConfiguration('aiCopilot');
  return config.get('backendUrl') || 'http://localhost:3000';
}

async function getSelectedCode(): Promise<string> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No editor active');
    return '';
  }

  const selection = editor.selection;
  const code = editor.document.getText(selection) || editor.document.getText();
  return code;
}

function getLanguage(): string {
  const editor = vscode.window.activeTextEditor;
  return editor?.document.languageId || 'javascript';
}

async function updateStatusBar() {
  statusBar.text = '$(sync) Checking...';
  statusBar.show();

  try {
    const backendUrl = await getBackendUrl();
    await axios.get(`${backendUrl}/api/health`, { timeout: 3000 });
    statusBar.text = '$(check) AI Copilot Ready';
    statusBar.color = undefined;
  } catch (error) {
    statusBar.text = '$(error) AI Copilot Offline';
    statusBar.color = '#ff6b6b';
  }
}

async function checkBackendHealth() {
  try {
    const backendUrl = await getBackendUrl();
    const response = await axios.get(`${backendUrl}/api/health`);
    vscode.window.showInformationMessage(`✅ AI Copilot is online\n🤖 Model: ${response.data.ollama.activeModel}`);
  } catch (error) {
    vscode.window.showErrorMessage('❌ AI Copilot backend is not running. Start it with: npm start');
  }
}

async function completeCommand() {
  const code = await getSelectedCode();
  if (!code) return;

  const backendUrl = await getBackendUrl();
  vscode.window.showInformationMessage('⏳ Generating completion...');

  try {
    const response = await axios.post(`${backendUrl}/api/complete`, {
      code,
      language: getLanguage(),
      context: 'Code completion request',
    });

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      await editor.edit((editBuilder) => {
        const position = editor.selection.end;
        editBuilder.insert(position, `\n${response.data.completion}`);
      });
    }
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error}`);
  }
}

async function explainCommand() {
  const code = await getSelectedCode();
  if (!code) return;

  const backendUrl = await getBackendUrl();
  vscode.window.showInformationMessage('⏳ Generating explanation...');

  try {
    const response = await axios.post(`${backendUrl}/api/explain`, {
      code,
      language: getLanguage(),
    });

    const panel = vscode.window.createWebviewPanel(
      'aiCopilotExplain',
      'AI Copilot Explanation',
      vscode.ViewColumn.Beside,
      {}
    );

    panel.webview.html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            pre { background: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h2>Code Explanation</h2>
          <p>${response.data.explanation.replace(/\n/g, '<br>')}</p>
        </body>
      </html>
    `;
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error}`);
  }
}

async function fixCommand() {
  const code = await getSelectedCode();
  if (!code) return;

  const backendUrl = await getBackendUrl();
  const description = await vscode.window.showInputBox({
    prompt: 'Describe the bug or issue (optional)',
    placeHolder: 'e.g., This function returns undefined when x is 0',
  });

  vscode.window.showInformationMessage('⏳ Analyzing and fixing...');

  try {
    const response = await axios.post(`${backendUrl}/api/fix`, {
      code,
      language: getLanguage(),
      description: description || '',
    });

    const panel = vscode.window.createWebviewPanel(
      'aiCopilotFix',
      'AI Copilot Fix Suggestion',
      vscode.ViewColumn.Beside,
      {}
    );

    panel.webview.html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            pre { background: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto; }
            button { padding: 10px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h2>Bug Fix Suggestion</h2>
          <pre>${response.data.suggestion}</pre>
        </body>
      </html>
    `;
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error}`);
  }
}

async function testCommand() {
  const code = await getSelectedCode();
  if (!code) return;

  const backendUrl = await getBackendUrl();
  const framework = await vscode.window.showQuickPick(
    ['jest', 'mocha', 'unittest', 'pytest', 'xunit'],
    { placeHolder: 'Select test framework' }
  ) || 'jest';

  vscode.window.showInformationMessage('⏳ Generating tests...');

  try {
    const response = await axios.post(`${backendUrl}/api/test`, {
      code,
      language: getLanguage(),
      framework,
    });

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      await editor.edit((editBuilder) => {
        const position = editor.document.lineAt(editor.document.lineCount - 1).range.end;
        editBuilder.insert(position, `\n\n${response.data.test}`);
      });
    }
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error}`);
  }
}

async function docsCommand() {
  const code = await getSelectedCode();
  if (!code) return;

  const backendUrl = await getBackendUrl();
  const style = await vscode.window.showQuickPick(
    ['jsdoc', 'sphinx', 'javadoc', 'godoc'],
    { placeHolder: 'Select documentation style' }
  ) || 'jsdoc';

  vscode.window.showInformationMessage('⏳ Generating documentation...');

  try {
    const response = await axios.post(`${backendUrl}/api/docs`, {
      code,
      language: getLanguage(),
      style,
    });

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      await editor.edit((editBuilder) => {
        const position = editor.selection.start;
        editBuilder.insert(position, `${response.data.documentation}\n`);
      });
    }
  } catch (error) {
    vscode.window.showErrorMessage(`❌ Error: ${error}`);
  }
}

export function deactivate() {
  statusBar.dispose();
}
