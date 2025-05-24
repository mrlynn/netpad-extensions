const vscode = require('vscode');
const axios = require('axios');

// Global variables for API client and output channel
let apiClient = null;
let outputChannel = null;

/**
 * Initialize the API client with current configuration
 */
function initializeApiClient() {
  const config = vscode.workspace.getConfiguration('netpad');
  const apiUrl = config.get('apiUrl') || 'https://netpad.io/api/mcp';
  const apiKey = config.get('apiKey') || '';
  const timeout = config.get('timeout') || 30000;

  if (!apiKey) {
    vscode.window.showWarningMessage('NetPad API key not configured. Please set it in settings.');
    return null;
  }

  apiClient = axios.create({
    baseURL: apiUrl,
    timeout: timeout,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    }
  });

  // Add request/response interceptors for logging
  const enableLogging = config.get('enableLogging', true);
  
  if (enableLogging) {
    apiClient.interceptors.request.use(request => {
      logMessage(`API Request: ${request.method?.toUpperCase()} ${request.url}`);
      logMessage(`Request data: ${JSON.stringify(request.data, null, 2)}`);
      return request;
    });

    apiClient.interceptors.response.use(
      response => {
        logMessage(`API Response: ${response.status} ${response.statusText}`);
        return response;
      },
      error => {
        logMessage(`API Error: ${error.message}`);
        if (error.response) {
          logMessage(`Error response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        return Promise.reject(error);
      }
    );
  }

  return apiClient;
}

/**
 * Get or create output channel
 */
function getOutputChannel() {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('NetPad');
  }
  return outputChannel;
}

/**
 * Log message to output channel
 */
function logMessage(message) {
  const channel = getOutputChannel();
  const timestamp = new Date().toISOString();
  channel.appendLine(`[${timestamp}] ${message}`);
}

/**
 * Show output with results
 */
function showOutput(title, content) {
  const channel = getOutputChannel();
  channel.appendLine(`\n=== ${title} ===`);
  channel.appendLine(content);
  channel.appendLine('='.repeat(title.length + 8));
  channel.show();
}

/**
 * Detect programming language from VS Code editor
 */
function detectLanguage(editor) {
  if (!editor) return 'text';
  
  const languageId = editor.document.languageId;
  
  // Map VS Code language IDs to common names
  const languageMap = {
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'java': 'java',
    'csharp': 'c#',
    'cpp': 'c++',
    'c': 'c',
    'go': 'go',
    'rust': 'rust',
    'php': 'php',
    'ruby': 'ruby',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'scala': 'scala',
    'r': 'r',
    'sql': 'sql',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'yaml': 'yaml',
    'xml': 'xml',
    'markdown': 'markdown'
  };

  return languageMap[languageId] || languageId || 'text';
}

/**
 * Get selected code from editor
 */
function getSelectedCode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor found');
    return null;
  }

  const selection = editor.selection;
  const code = editor.document.getText(selection);
  
  if (!code || code.trim().length === 0) {
    vscode.window.showErrorMessage('No code selected');
    return null;
  }

  return {
    code: code,
    language: detectLanguage(editor),
    fileName: editor.document.fileName
  };
}

/**
 * Make API request to NetPad
 */
async function makeNetPadRequest(type, input) {
  if (!apiClient) {
    apiClient = initializeApiClient();
    if (!apiClient) return null;
  }

  try {
    const response = await apiClient.post('/command', {
      type: type,
      input: input
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    throw new Error(`NetPad API Error: ${errorMessage}`);
  }
}

/**
 * Command: Analyze Code
 */
async function analyzeCodeCommand() {
  const codeData = getSelectedCode();
  if (!codeData) return;

  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Analyzing code with NetPad...",
      cancellable: false
    }, async () => {
      const result = await makeNetPadRequest('code_analysis', {
        code: codeData.code,
        language: codeData.language,
        analysisType: 'summary'
      });

      if (result && result.output) {
        showOutput('Code Analysis', result.output);
        vscode.window.showInformationMessage('Code analysis complete! Check NetPad output.');
      } else {
        vscode.window.showWarningMessage('No analysis result received from NetPad');
      }
    });
  } catch (error) {
    logMessage(`Analysis error: ${error.message}`);
    vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
  }
}

/**
 * Command: Explain Code
 */
async function explainCodeCommand() {
  const codeData = getSelectedCode();
  if (!codeData) return;

  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Getting code explanation...",
      cancellable: false
    }, async () => {
      const result = await makeNetPadRequest('code_analysis', {
        code: codeData.code,
        language: codeData.language,
        analysisType: 'explanation'
      });

      if (result && result.output) {
        showOutput('Code Explanation', result.output);
        vscode.window.showInformationMessage('Code explanation ready! Check NetPad output.');
      } else {
        vscode.window.showWarningMessage('No explanation received from NetPad');
      }
    });
  } catch (error) {
    logMessage(`Explanation error: ${error.message}`);
    vscode.window.showErrorMessage(`Explanation failed: ${error.message}`);
  }
}

/**
 * Command: Refactor Code
 */
async function refactorCodeCommand() {
  const codeData = getSelectedCode();
  if (!codeData) return;

  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Generating refactoring suggestions...",
      cancellable: false
    }, async () => {
      const result = await makeNetPadRequest('code_analysis', {
        code: codeData.code,
        language: codeData.language,
        analysisType: 'refactor'
      });

      if (result && result.output) {
        showOutput('Refactoring Suggestions', result.output);
        vscode.window.showInformationMessage('Refactoring suggestions ready! Check NetPad output.');
      } else {
        vscode.window.showWarningMessage('No refactoring suggestions received from NetPad');
      }
    });
  } catch (error) {
    logMessage(`Refactoring error: ${error.message}`);
    vscode.window.showErrorMessage(`Refactoring failed: ${error.message}`);
  }
}

/**
 * Command: Extract Data Lineage
 */
async function extractDataLineageCommand() {
  const codeData = getSelectedCode();
  if (!codeData) return;

  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Extracting data lineage...",
      cancellable: false
    }, async () => {
      const result = await makeNetPadRequest('code_analysis', {
        code: codeData.code,
        language: codeData.language,
        analysisType: 'data_lineage'
      });

      if (result && result.output) {
        showOutput('Data Lineage Analysis', result.output);
        vscode.window.showInformationMessage('Data lineage extraction complete! Check NetPad output.');
      } else {
        vscode.window.showWarningMessage('No data lineage information received from NetPad');
      }
    });
  } catch (error) {
    logMessage(`Data lineage error: ${error.message}`);
    vscode.window.showErrorMessage(`Data lineage extraction failed: ${error.message}`);
  }
}

/**
 * Command: Get Available Tools
 */
async function getToolsCommand() {
  if (!apiClient) {
    apiClient = initializeApiClient();
    if (!apiClient) return;
  }

  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Fetching available tools...",
      cancellable: false
    }, async () => {
      const response = await apiClient.get('/tools');
      
      if (response.data && response.data.tools) {
        const toolsList = response.data.tools.map(tool => {
          return `• ${tool.name}: ${tool.description || 'No description'}${tool.agentEnabled ? ' (Agent-enabled)' : ''}`;
        }).join('\n');
        
        showOutput('Available NetPad Tools', toolsList);
        vscode.window.showInformationMessage(`Found ${response.data.tools.length} available tools! Check NetPad output.`);
      } else {
        vscode.window.showWarningMessage('No tools information received from NetPad');
      }
    });
  } catch (error) {
    logMessage(`Tools fetch error: ${error.message}`);
    vscode.window.showErrorMessage(`Failed to fetch tools: ${error.message}`);
  }
}

/**
 * Extension activation
 */
function activate(context) {
  logMessage('NetPad extension is activating...');

  // Initialize API client
  initializeApiClient();

  // Register all commands
  const commands = [
    vscode.commands.registerCommand('netpad.analyzeCode', analyzeCodeCommand),
    vscode.commands.registerCommand('netpad.explainCode', explainCodeCommand),
    vscode.commands.registerCommand('netpad.refactorCode', refactorCodeCommand),
    vscode.commands.registerCommand('netpad.extractDataLineage', extractDataLineageCommand),
    vscode.commands.registerCommand('netpad.getTools', getToolsCommand)
  ];

  // Add to subscriptions
  commands.forEach(command => context.subscriptions.push(command));

  // Watch for configuration changes
  const configWatcher = vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('netpad')) {
      logMessage('NetPad configuration changed, reinitializing API client...');
      apiClient = initializeApiClient();
    }
  });
  context.subscriptions.push(configWatcher);

  logMessage('NetPad extension activated successfully');
}

/**
 * Extension deactivation
 */
function deactivate() {
  if (outputChannel) {
    outputChannel.dispose();
  }
  logMessage('NetPad extension deactivated');
}

module.exports = { activate, deactivate };