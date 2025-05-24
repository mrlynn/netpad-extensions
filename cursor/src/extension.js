// cursor/src/extension.js
const vscode = require('vscode');
const axios = require('axios');

class NetPadCursorExtension {
  constructor() {
    this.apiClient = null;
    this.outputChannel = null;
    this.tools = [];
  }

  /**
   * Initialize the extension
   */
  async initialize(context) {
    this.context = context;
    this.outputChannel = vscode.window.createOutputChannel('NetPad');
    
    // Register commands first (this is critical for activation)
    this.registerCommands();
    
    // Initialize API client (don't fail if this fails)
    try {
      await this.initializeApiClient();
    } catch (error) {
      this.log(`API client initialization failed: ${error.message}`);
    }
    
    // Try to fetch available tools, but don't fail if no API key
    try {
      if (this.apiClient) {
        await this.fetchTools();
      }
    } catch (error) {
      this.log(`Tool fetching failed: ${error.message}`);
    }
    
    // Setup configuration watcher
    this.setupConfigurationWatcher();
    
    this.log('NetPad Cursor extension initialized successfully');
  }

  /**
   * Initialize API client with current settings
   */
  async initializeApiClient() {
    const config = vscode.workspace.getConfiguration('netpad');
    const apiUrl = config.get('apiUrl') || process.env.NETPAD_API_URL || 'https://netpad.io/api/mcp';
    const apiKey = config.get('apiKey') || process.env.NETPAD_API_KEY || '';
    const timeout = config.get('timeout') || 30000;

    if (!apiKey) {
      this.log('NetPad API key not configured. Some features will be limited.');
      // Don't return early - allow extension to activate without API key
    }

    // Only create API client if we have an API key
    if (apiKey) {
      this.apiClient = axios.create({
        baseURL: apiUrl,
        timeout: timeout,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'User-Agent': 'NetPad-Cursor-Extension/1.0.0'
        }
      });
    }

    // Add interceptors for better error handling and logging (only if client exists)
    if (this.apiClient) {
      this.apiClient.interceptors.request.use(
        config => {
          this.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        error => {
          this.log(`Request Error: ${error.message}`);
          return Promise.reject(error);
        }
      );

      this.apiClient.interceptors.response.use(
        response => {
          this.log(`API Response: ${response.status} ${response.statusText}`);
          return response;
        },
        error => {
          this.log(`Response Error: ${error.message}`);
          if (error.response) {
            this.log(`Error Details: ${JSON.stringify(error.response.data, null, 2)}`);
          }
          return Promise.reject(error);
        }
      );
    }
  }

  /**
   * Fetch available tools from NetPad
   */
  async fetchTools() {
    if (!this.apiClient) return;

    try {
      const response = await this.apiClient.get('/tools');
      this.tools = response.data.tools || [];
      this.log(`Fetched ${this.tools.length} tools from NetPad`);
    } catch (error) {
      this.log(`Failed to fetch tools: ${error.message}`);
    }
  }

  /**
   * Register all commands
   */
  registerCommands() {
    const commands = [
      { name: 'netpad.analyzeCode', handler: this.analyzeCode.bind(this) },
      { name: 'netpad.explainCode', handler: this.explainCode.bind(this) },
      { name: 'netpad.refactorCode', handler: this.refactorCode.bind(this) },
      { name: 'netpad.extractDataLineage', handler: this.extractDataLineage.bind(this) },
      { name: 'netpad.getTools', handler: this.getTools.bind(this) },
      { name: 'netpad.runCustomWorkflow', handler: this.runCustomWorkflow.bind(this) },
      { name: 'netpad.sqlMetadataLookup', handler: this.sqlMetadataLookup.bind(this) }
    ];

    commands.forEach(cmd => {
      const disposable = vscode.commands.registerCommand(cmd.name, cmd.handler);
      this.context.subscriptions.push(disposable);
    });
  }

  /**
   * Setup configuration change watcher
   */
  setupConfigurationWatcher() {
    const watcher = vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('netpad')) {
        this.log('Configuration changed, reinitializing...');
        this.initializeApiClient();
        this.fetchTools();
      }
    });
    this.context.subscriptions.push(watcher);
  }

  /**
   * Get selected code and context
   */
  getCodeContext() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return null;
    }

    const selection = editor.selection;
    const code = editor.document.getText(selection);
    
    if (!code.trim()) {
      vscode.window.showErrorMessage('No code selected');
      return null;
    }

    return {
      code,
      language: this.detectLanguage(editor),
      fileName: editor.document.fileName,
      lineStart: selection.start.line,
      lineEnd: selection.end.line,
      fullDocument: editor.document.getText()
    };
  }

  /**
   * Detect programming language
   */
  detectLanguage(editor) {
    const languageId = editor.document.languageId;
    const languageMap = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'csharp': 'c#',
      'cpp': 'c++',
      'sql': 'sql',
      'json': 'json',
      'yaml': 'yaml'
    };
    return languageMap[languageId] || languageId || 'text';
  }

  /**
   * Make API request with error handling
   */
  async makeRequest(endpoint, data) {
    if (!this.apiClient) {
      await this.initializeApiClient();
      if (!this.apiClient) {
        throw new Error('API client not initialized. Please check your configuration.');
      }
    }

    try {
      const response = await this.apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new Error(`NetPad API Error: ${message}`);
    }
  }

  /**
   * Show results in output panel
   */
  showResults(title, content) {
    this.outputChannel.clear();
    this.outputChannel.appendLine(`=== ${title} ===`);
    this.outputChannel.appendLine(new Date().toISOString());
    this.outputChannel.appendLine('');
    this.outputChannel.appendLine(content);
    this.outputChannel.show();
  }

  /**
   * Log message
   */
  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[NetPad] ${timestamp}: ${message}`);
  }

  /**
   * Analyze Code Command
   */
  async analyzeCode() {
    const context = this.getCodeContext();
    if (!context) return;

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Analyzing code...",
        cancellable: true
      }, async (progress) => {
        progress.report({ message: "Sending code to NetPad..." });
        
        const result = await this.makeRequest('/command', {
          type: 'code_analysis',
          input: {
            code: context.code,
            language: context.language,
            analysisType: 'comprehensive',
            fileName: context.fileName
          }
        });

        if (result?.output) {
          this.showResults('Code Analysis', result.output);
          vscode.window.showInformationMessage('Code analysis complete!');
        } else {
          vscode.window.showWarningMessage('No analysis results received');
        }
      });
    } catch (error) {
      this.log(`Analysis error: ${error.message}`);
      vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Explain Code Command
   */
  async explainCode() {
    const context = this.getCodeContext();
    if (!context) return;

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating explanation...",
        cancellable: true
      }, async () => {
        const result = await this.makeRequest('/command', {
          type: 'code_analysis',
          input: {
            code: context.code,
            language: context.language,
            analysisType: 'explanation'
          }
        });

        if (result?.output) {
          this.showResults('Code Explanation', result.output);
          vscode.window.showInformationMessage('Code explanation ready!');
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Explanation failed: ${error.message}`);
    }
  }

  /**
   * Refactor Code Command
   */
  async refactorCode() {
    const context = this.getCodeContext();
    if (!context) return;

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating refactoring suggestions...",
        cancellable: true
      }, async () => {
        const result = await this.makeRequest('/command', {
          type: 'code_analysis',
          input: {
            code: context.code,
            language: context.language,
            analysisType: 'refactor',
            context: {
              fileName: context.fileName,
              surroundingCode: context.fullDocument.substring(
                Math.max(0, context.code.indexOf(context.code) - 500),
                context.code.indexOf(context.code) + context.code.length + 500
              )
            }
          }
        });

        if (result?.output) {
          this.showResults('Refactoring Suggestions', result.output);
          vscode.window.showInformationMessage('Refactoring suggestions ready!');
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Refactoring failed: ${error.message}`);
    }
  }

  /**
   * Extract Data Lineage Command
   */
  async extractDataLineage() {
    const context = this.getCodeContext();
    if (!context) return;

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Extracting data lineage...",
        cancellable: true
      }, async () => {
        const result = await this.makeRequest('/command', {
          type: 'data_lineage_extraction',
          input: {
            code: context.code,
            language: context.language,
            fileName: context.fileName
          }
        });

        if (result?.output) {
          this.showResults('Data Lineage', result.output);
          vscode.window.showInformationMessage('Data lineage extraction complete!');
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Data lineage extraction failed: ${error.message}`);
    }
  }

  /**
   * Get Tools Command
   */
  async getTools() {
    try {
      if (!this.apiClient) {
        vscode.window.showErrorMessage('NetPad API not configured. Please set your API key in settings.');
        this.showResults('NetPad Configuration Required', 
          'To use NetPad tools, please configure your API credentials:\n\n' +
          '1. Open Settings (Cmd/Ctrl + ,)\n' +
          '2. Search for "netpad"\n' +
          '3. Set your NetPad API URL and API Key\n\n' +
          'Extension is loaded and ready to use once configured!'
        );
        return;
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Fetching available tools...",
        cancellable: false
      }, async () => {
        await this.fetchTools();
        
        if (this.tools.length > 0) {
          const toolsList = this.tools.map(tool => 
            `• ${tool.name}: ${tool.description || 'No description'}${tool.agentEnabled ? ' (Agent-enabled)' : ''}`
          ).join('\n');
          
          this.showResults('Available NetPad Tools', toolsList);
          vscode.window.showInformationMessage(`Found ${this.tools.length} tools!`);
        } else {
          vscode.window.showWarningMessage('No tools available');
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to fetch tools: ${error.message}`);
    }
  }

/**
 * Run Custom Workflow Command
 */
async runCustomWorkflow() {
    const context = this.getCodeContext();
    if (!context) return;
  
    const workflowName = await vscode.window.showInputBox({
      prompt: 'Enter workflow processor type (e.g., custom_processor, metadata_audit)',
      placeHolder: 'e.g., custom_processor'
    });
    if (!workflowName) return;
  
    const workflowGraph = {
      nodes: [
        {
          id: 'start',
          type: 'input',
          data: {
            code: context.code,
            language: context.language,
            fileName: context.fileName
          }
        },
        {
          id: 'processor',
          type: workflowName,
          inputs: { code: 'start.output' },
          outputs: ['result']
        }
      ],
      connections: [
        { from: 'start', to: 'processor', port: 'code' }
      ],
      startNodeId: 'start',
      context: {
        project: 'Cursor NetPad Extension',
        sessionId: Date.now().toString(),
        user: process.env.USER || 'cursor-user'
      }
    };
  
    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Running custom workflow: ${workflowName}`,
        cancellable: false
      }, async () => {
        const response = await this.makeRequest('/workflow/run', workflowGraph);
  
        const output = response?.data?.portData?.result || JSON.stringify(response.data || response);
        if (output) {
          this.showResults(`Workflow: ${workflowName}`, output);
          vscode.window.showInformationMessage(`Workflow ${workflowName} executed successfully.`);
        } else {
          vscode.window.showWarningMessage('Workflow completed but returned no result.');
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Workflow execution failed: ${error.message}`);
    }
  }
  

  /**
   * SQL Metadata Lookup Command
   */
  async sqlMetadataLookup() {
    const context = this.getCodeContext();
    if (!context) return;

    // Check if it's SQL code
    if (!context.language.includes('sql')) {
      const proceed = await vscode.window.showWarningMessage(
        'Selected code is not detected as SQL. Continue anyway?',
        'Yes', 'No'
      );
      if (proceed !== 'Yes') return;
    }

    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Analyzing SQL metadata...",
        cancellable: true
      }, async () => {
        const result = await this.makeRequest('/command', {
          type: 'sql_metadata_lookup',
          input: {
            sql: context.code,
            fileName: context.fileName
          }
        });

        if (result?.output) {
          this.showResults('SQL Metadata Analysis', result.output);
          vscode.window.showInformationMessage('SQL metadata analysis complete!');
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`SQL metadata lookup failed: ${error.message}`);
    }
  }
}

// Extension activation
let extensionInstance = null;

async function activate(context) {
  try {
    console.log('NetPad Cursor extension: Starting activation...');
    extensionInstance = new NetPadCursorExtension();
    await extensionInstance.initialize(context);
    console.log('NetPad Cursor extension activated successfully');
    
    // Show a success message to confirm activation
    vscode.window.showInformationMessage('NetPad extension loaded! Use Command Palette to access NetPad commands.');
  } catch (error) {
    console.error('Failed to activate NetPad extension:', error);
    vscode.window.showErrorMessage(`NetPad extension activation failed: ${error.message}`);
    
    // Still register at least the getTools command even if initialization fails
    try {
      const disposable = vscode.commands.registerCommand('netpad.getTools', () => {
        vscode.window.showErrorMessage('NetPad extension failed to initialize properly. Please check the console for errors.');
      });
      context.subscriptions.push(disposable);
    } catch (fallbackError) {
      console.error('Even fallback command registration failed:', fallbackError);
    }
  }
}

function deactivate() {
  if (extensionInstance?.outputChannel) {
    extensionInstance.outputChannel.dispose();
  }
  console.log('NetPad Cursor extension deactivated');
}

module.exports = { activate, deactivate };