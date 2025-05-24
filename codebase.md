# .env-example

```
# NetPad Configuration
NETPAD_API_URL=https://netpad.io/api/mcp
NETPAD_API_KEY=your_api_key_here

# Optional: Override default settings
NETPAD_TIMEOUT=30000
NETPAD_RETRIES=3
```

# .gitignore

```
# Node modules
node_modules/
*.vsix

# Local environment and logs
.env
*.log


```

# common/apiClient.js

```js
// common/apiClient.js
const axios = require('axios');

class NetPadApiClient {
  constructor(options = {}) {
    this.config = {
      baseURL: options.apiUrl || process.env.NETPAD_API_URL || 'https://netpad.io/api/mcp',
      apiKey: options.apiKey || process.env.NETPAD_API_KEY || '',
      timeout: options.timeout || parseInt(process.env.NETPAD_TIMEOUT) || 30000,
      retries: options.retries || parseInt(process.env.NETPAD_RETRIES) || 3,
      enableLogging: options.enableLogging !== false
    };

    this.client = null;
    this.initialize();
  }

  /**
   * Initialize the axios client
   */
  initialize() {
    if (!this.config.apiKey) {
      throw new Error('NetPad API key is required. Set NETPAD_API_KEY environment variable or pass apiKey option.');
    }

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
        'User-Agent': 'NetPad-Extension/1.0.0'
      }
    });

    this.setupInterceptors();
  }

  /**
   * Setup request/response interceptors
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.config.enableLogging) {
          console.log(`[NetPad API] ${config.method?.toUpperCase()} ${config.url}`);
          console.log(`[NetPad API] Request data:`, JSON.stringify(config.data, null, 2));
        }
        return config;
      },
      (error) => {
        this.log(`Request interceptor error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (this.config.enableLogging) {
          console.log(`[NetPad API] Response: ${response.status} ${response.statusText}`);
        }
        return response;
      },
      async (error) => {
        this.log(`Response error: ${error.message}`);
        
        // Handle retry logic
        const config = error.config;
        if (!config.__retryCount) {
          config.__retryCount = 0;
        }

        if (config.__retryCount < this.config.retries && this.shouldRetry(error)) {
          config.__retryCount++;
          this.log(`Retrying request (${config.__retryCount}/${this.config.retries})`);
          
          // Exponential backoff
          const delay = Math.pow(2, config.__retryCount) * 1000;
          await this.sleep(delay);
          
          return this.client.request(config);
        }

        return Promise.reject(this.enhanceError(error));
      }
    );
  }

  /**
   * Determine if request should be retried
   */
  shouldRetry(error) {
    if (!error.response) {
      // Network errors should be retried
      return true;
    }

    const status = error.response.status;
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429;
  }

  /**
   * Enhance error with more context
   */
  enhanceError(error) {
    const enhanced = new Error();
    
    if (error.response) {
      enhanced.message = `NetPad API Error (${error.response.status}): ${error.response.data?.message || error.response.statusText}`;
      enhanced.status = error.response.status;
      enhanced.data = error.response.data;
    } else if (error.request) {
      enhanced.message = 'NetPad API Error: No response received (network error)';
    } else {
      enhanced.message = `NetPad API Error: ${error.message}`;
    }

    enhanced.originalError = error;
    return enhanced;
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log messages if logging is enabled
   */
  log(message) {
    if (this.config.enableLogging) {
      console.log(`[NetPad API] ${new Date().toISOString()}: ${message}`);
    }
  }

  /**
   * Execute a command
   */
  async executeCommand(type, input) {
    try {
      const response = await this.client.post('/command', {
        type,
        input
      });

      return response.data;
    } catch (error) {
      this.log(`Command execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get available tools
   */
  async getTools() {
    try {
      const response = await this.client.get('/tools');
      return response.data;
    } catch (error) {
      this.log(`Failed to fetch tools: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a specific tool
   */
  async executeTool(toolName, parameters = {}) {
    try {
      const response = await this.client.post('/tools/execute', {
        tool: toolName,
        parameters
      });

      return response.data;
    } catch (error) {
      this.log(`Tool execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze code
   */
  async analyzeCode(code, language, analysisType = 'summary', options = {}) {
    return this.executeCommand('code_analysis', {
      code,
      language,
      analysisType,
      ...options
    });
  }

  /**
   * Extract data lineage
   */
  async extractDataLineage(code, language, fileName = null) {
    return this.executeCommand('data_lineage_extraction', {
      code,
      language,
      fileName
    });
  }

  /**
   * Perform SQL metadata lookup
   */
  async sqlMetadataLookup(sql, options = {}) {
    return this.executeCommand('sql_metadata_lookup', {
      sql,
      ...options
    });
  }

  /**
   * Run custom workflow
   */
  async runWorkflow(workflowName, input) {
    return this.executeCommand('custom_workflow', {
      workflowName,
      ...input
    });
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      this.log(`Health check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      await this.healthCheck();
      this.log('Connection test successful');
      return { success: true, message: 'Connected to NetPad API successfully' };
    } catch (error) {
      this.log(`Connection test failed: ${error.message}`);
      return { 
        success: false, 
        message: `Connection failed: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.initialize();
  }
}

// Factory function for creating client instances
function createNetPadClient(options = {}) {
  return new NetPadApiClient(options);
}

// Default instance
let defaultClient = null;

function getDefaultClient() {
  if (!defaultClient) {
    try {
      defaultClient = new NetPadApiClient();
    } catch (error) {
      console.warn('Failed to create default NetPad client:', error.message);
      return null;
    }
  }
  return defaultClient;
}

// Convenience functions using default client
async function analyzeCode(code, language, analysisType = 'summary') {
  const client = getDefaultClient();
  if (!client) throw new Error('NetPad client not configured');
  return client.analyzeCode(code, language, analysisType);
}

async function getTools() {
  const client = getDefaultClient();
  if (!client) throw new Error('NetPad client not configured');
  return client.getTools();
}

async function executeTool(toolName, parameters) {
  const client = getDefaultClient();
  if (!client) throw new Error('NetPad client not configured');
  return client.executeTool(toolName, parameters);
}

module.exports = {
  NetPadApiClient,
  createNetPadClient,
  getDefaultClient,
  analyzeCode,
  getTools,
  executeTool
};
```

# cursor/.vscodeignore

```
node_modules/
.vscode/
.vscodeignore
scripts/
*.vsix
*.log
*.md
.env


```

# cursor/manifest.json

```json
{
    "name": "netpad-cursor",
    "displayName": "NetPad for Cursor",
    "description": "AI-powered code analysis and assistance via NetPad API - Optimized for Cursor",
    "version": "1.0.0",
    "publisher": "your-publisher-name",
    "engines": {
        "vscode": "^1.74.0",
        "cursor": "^0.1.0"
    },
    "categories": [
        "Other",
        "Machine Learning",
        "Programming Languages"
    ],
    "keywords": [
        "ai",
        "code-analysis",
        "mcp",
        "netpad",
        "cursor",
        "assistant"
    ],
    "activationEvents": [
        "onCommand:netpad.analyzeCode",
        "onCommand:netpad.explainCode",
        "onCommand:netpad.refactorCode"
    ],
    "main": "./src/extension.js",
    "contributes": {
        "commands": [
            {
                "command": "netpad.analyzeCode",
                "title": "🔍 Analyze Code",
                "category": "NetPad",
                "icon": "$(search)"
            },
            {
                "command": "netpad.explainCode",
                "title": "💬 Explain Code",
                "category": "NetPad",
                "icon": "$(comment-discussion)"
            },
            {
                "command": "netpad.refactorCode",
                "title": "🔧 Refactor Code",
                "category": "NetPad",
                "icon": "$(tools)"
            },
            {
                "command": "netpad.extractDataLineage",
                "title": "🌐 Extract Data Lineage",
                "category": "NetPad",
                "icon": "$(git-branch)"
            },
            {
                "command": "netpad.getTools",
                "title": "🛠️ Get Available Tools",
                "category": "NetPad",
                "icon": "$(list-unordered)"
            },
            {
                "command": "netpad.runCustomWorkflow",
                "title": "⚙️ Run Custom Workflow",
                "category": "NetPad",
                "icon": "$(gear)"
            },
            {
                "command": "netpad.sqlMetadataLookup",
                "title": "🗄️ SQL Metadata Lookup",
                "category": "NetPad",
                "icon": "$(database)"
            },
            {
                "command": "netpad.openSidebar",
                "title": "📋 Open NetPad Sidebar",
                "category": "NetPad",
                "icon": "$(sidebar-left)"
            }
        ],
        "menus": {
            "editor/context": [
                {
                    "submenu": "netpad.submenu",
                    "when": "editorTextFocus",
                    "group": "navigation@1"
                }
            ],
            "netpad.submenu": [
                {
                    "command": "netpad.analyzeCode",
                    "when": "editorHasSelection",
                    "group": "analysis@1"
                },
                {
                    "command": "netpad.explainCode",
                    "when": "editorHasSelection",
                    "group": "analysis@2"
                },
                {
                    "command": "netpad.refactorCode",
                    "when": "editorHasSelection",
                    "group": "analysis@3"
                },
                {
                    "command": "netpad.extractDataLineage",
                    "when": "editorHasSelection",
                    "group": "analysis@4"
                },
                {
                    "command": "netpad.sqlMetadataLookup",
                    "when": "editorHasSelection && editorLangId =~ /sql/",
                    "group": "analysis@5"
                },
                {
                    "separator": "",
                    "group": "tools@1"
                },
                {
                    "command": "netpad.runCustomWorkflow",
                    "when": "editorHasSelection",
                    "group": "tools@2"
                },
                {
                    "command": "netpad.getTools",
                    "group": "tools@3"
                }
            ],
            "commandPalette": [
                {
                    "command": "netpad.analyzeCode",
                    "when": "editorHasSelection"
                },
                {
                    "command": "netpad.explainCode",
                    "when": "editorHasSelection"
                },
                {
                    "command": "netpad.refactorCode",
                    "when": "editorHasSelection"
                },
                {
                    "command": "netpad.extractDataLineage",
                    "when": "editorHasSelection"
                },
                {
                    "command": "netpad.sqlMetadataLookup",
                    "when": "editorHasSelection"
                },
                {
                    "command": "netpad.runCustomWorkflow",
                    "when": "editorHasSelection"
                },
                {
                    "command": "netpad.getTools"
                },
                {
                    "command": "netpad.openSidebar"
                }
            ],
            "view/title": [
                {
                    "command": "netpad.getTools",
                    "when": "view == netpadSidebar",
                    "group": "navigation"
                }
            ]
        },
        "submenus": [
            {
                "id": "netpad.submenu",
                "label": "NetPad AI",
                "icon": "$(robot)"
            }
        ],
        "views": {
            "explorer": [
                {
                    "id": "netpadSidebar",
                    "name": "NetPad Tools",
                    "when": "netpad.enabled"
                }
            ]
        },
        "viewsContainers": {
            "activitybar": [
                {
                    "id": "netpad",
                    "title": "NetPad",
                    "icon": "$(robot)"
                }
            ]
        },
        "configuration": {
            "title": "NetPad",
            "properties": {
                "netpad.apiUrl": {
                    "type": "string",
                    "default": "https://netpad.io/api/mcp",
                    "description": "NetPad API base URL",
                    "order": 1
                },
                "netpad.apiKey": {
                    "type": "string",
                    "default": "",
                    "description": "NetPad API key (required for authentication)",
                    "order": 2
                },
                "netpad.timeout": {
                    "type": "number",
                    "default": 30000,
                    "description": "Request timeout in milliseconds",
                    "minimum": 5000,
                    "maximum": 120000,
                    "order": 3
                },
                "netpad.enableLogging": {
                    "type": "boolean",
                    "default": true,
                    "description": "Enable detailed logging for debugging",
                    "order": 4
                },
                "netpad.autoDetectLanguage": {
                    "type": "boolean",
                    "default": true,
                    "description": "Automatically detect programming language",
                    "order": 5
                },
                "netpad.showProgressNotifications": {
                    "type": "boolean",
                    "default": true,
                    "description": "Show progress notifications for API requests",
                    "order": 6
                },
                "netpad.defaultAnalysisType": {
                    "type": "string",
                    "default": "comprehensive",
                    "enum": [
                        "summary",
                        "detailed",
                        "comprehensive",
                        "explanation",
                        "refactor"
                    ],
                    "description": "Default analysis type for code analysis",
                    "order": 7
                },
                "netpad.enableSidebar": {
                    "type": "boolean",
                    "default": true,
                    "description": "Enable NetPad sidebar panel",
                    "order": 8
                }
            }
        },
        "keybindings": [
            {
                "command": "netpad.analyzeCode",
                "key": "ctrl+alt+a",
                "mac": "cmd+alt+a",
                "when": "editorTextFocus && editorHasSelection"
            },
            {
                "command": "netpad.explainCode",
                "key": "ctrl+alt+e",
                "mac": "cmd+alt+e",
                "when": "editorTextFocus && editorHasSelection"
            },
            {
                "command": "netpad.refactorCode",
                "key": "ctrl+alt+r",
                "mac": "cmd+alt+r",
                "when": "editorTextFocus && editorHasSelection"
            }
        ]
    },
    "scripts": {
        "test": "node scripts/testNetPadIntegration.js",
        "package": "vsce package",
        "publish": "vsce publish",
        "dev": "node scripts/devServer.js"
    },
    "dependencies": {
        "axios": "^1.6.0",
        "dotenv": "^16.3.1"
    },
    "devDependencies": {
        "@types/vscode": "^1.74.0",
        "@vscode/vsce": "^2.19.0",
        "eslint": "^8.0.0"
    },
    "repository": {
        "type": "git",
        "url": "https://github.com/mrlynn/netpad-cursor-extensions"
    },
    "bugs": {
        "url": "https://github.com/mrlynn/netpad-cursor-extensions/issues"
    },
    "homepage": "https://github.com/mrlynn/netpad-cursor-extensions#readme",
    "license": "MIT"
}
```

# cursor/media/netpad.png

This is a binary file of the type: Image

# cursor/netpad-cursor-1.0.0.vsix

This is a binary file of the type: Binary

# cursor/package.json

```json
{
  "name": "netpad-cursor",
  "version": "1.0.0",
  "description": "NetPad AI assistant for Cursor editor",
  "main": "src/extension.js",
  "publisher": "michael-lynn",
  "repository": {
    "type": "git",
    "url": "https://github.com/mrlynn/netpad-cursor-extensions"
  },
  "bugs": {
    "url": "https://github.com/mrlynn/netpad-cursor-extensions/issues"
  },
  "icon": "media/netpad.png",
  "engines": {
    "vscode": "^1.85.0"
  },
  "contributes": {
    "commands": [
      {
        "command": "netpad.getTools",
        "title": "NetPad: Get Available Tools"
      }
    ]
  },
  "scripts": {
    "test": "node ../scripts/testNetPadIntegration.js"
  },
  "activationEvents": [
    "onCommand:netpad.analyzeCode",
    "onCommand:netpad.explainCode",
    "onCommand:netpad.refactorCode",
    "onCommand:netpad.extractDataLineage",
    "onCommand:netpad.runCustomWorkflow",
    "onCommand:netpad.sqlMetadataLookup",
    "onCommand:netpad.openSidebar"
  ],
  "dependencies": {
    "axios": "^1.6.0",
    "dotenv": "^16.5.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.74.0"
  }
}
```

# cursor/src/extension.js

```js
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
    
    // Initialize API client
    await this.initializeApiClient();
    
    // Fetch available tools on startup
    await this.fetchTools();
    
    // Register commands
    this.registerCommands();
    
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
      vscode.window.showWarningMessage('NetPad API key not configured. Please set it in settings or environment variables.');
      return;
    }

    this.apiClient = axios.create({
      baseURL: apiUrl,
      timeout: timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': 'NetPad-Cursor-Extension/1.0.0'
      }
    });

    // Add interceptors for better error handling and logging
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
    extensionInstance = new NetPadCursorExtension();
    await extensionInstance.initialize(context);
    console.log('NetPad Cursor extension activated successfully');
  } catch (error) {
    console.error('Failed to activate NetPad extension:', error);
    vscode.window.showErrorMessage(`NetPad extension activation failed: ${error.message}`);
  }
}

function deactivate() {
  if (extensionInstance?.outputChannel) {
    extensionInstance.outputChannel.dispose();
  }
  console.log('NetPad Cursor extension deactivated');
}

module.exports = { activate, deactivate };
```

# README.md

```md
# NetPad Extensions for VSCode & Cursor

AI-powered code analysis and assistance extensions that integrate with the NetPad API to provide intelligent code insights, refactoring suggestions, data lineage extraction, and more.

## 🚀 Features

- **Code Analysis**: Get comprehensive analysis of your code including complexity, patterns, and suggestions
- **Code Explanation**: Receive detailed explanations of how your code works
- **Refactoring Suggestions**: Get intelligent suggestions to improve your code structure
- **Data Lineage Extraction**: Analyze data flow and dependencies in your code
- **SQL Metadata Lookup**: Extract metadata and relationships from SQL queries
- **Custom Workflows**: Run specialized analysis workflows (security audits, performance analysis, etc.)
- **Tool Discovery**: Explore available NetPad tools and capabilities

## 📦 Installation

### Prerequisites

1. **NetPad API Access**: You need a valid NetPad API key
2. **VSCode or Cursor**: Version 1.74.0 or higher
3. **Node.js**: Required for development and testing

### VSCode Extension

1. Download the `.vsix` file from the releases
2. Install via command palette:
   \`\`\`
   > Extensions: Install from VSIX...
   \`\`\`
3. Configure your API credentials (see Configuration section)

### Cursor Extension

1. Clone this repository
2. Navigate to the `cursor/` directory
3. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
4. Package the extension:
   \`\`\`bash
   npm run package
   \`\`\`
5. Install the generated `.vsix` file

## ⚙️ Configuration

### Method 1: VS Code Settings

Open VS Code settings and configure:

- `netpad.apiUrl`: NetPad API base URL (default: `https://netpad.io/api/mcp`)
- `netpad.apiKey`: Your NetPad API key (**required**)
- `netpad.timeout`: Request timeout in milliseconds (default: 30000)
- `netpad.enableLogging`: Enable detailed logging (default: true)

### Method 2: Environment Variables

Create a `.env` file in your project root:

\`\`\`bash
NETPAD_API_URL=https://netpad.io/api/mcp
NETPAD_API_KEY=your_api_key_here
NETPAD_TIMEOUT=30000
NETPAD_ENABLE_LOGGING=true
\`\`\`

### Method 3: Settings.json

Add to your VS Code `settings.json`:

\`\`\`json
{
  "netpad.apiUrl": "https://netpad.io/api/mcp",
  "netpad.apiKey": "your_api_key_here",
  "netpad.timeout": 30000,
  "netpad.enableLogging": true
}
\`\`\`

## 🎯 Usage

### Basic Commands

#### 1. Analyze Code
- Select code in the editor
- Right-click → "NetPad AI" → "🔍 Analyze Code"
- Or use keyboard shortcut: `Ctrl+Alt+A` (Windows/Linux) or `Cmd+Alt+A` (Mac)

#### 2. Explain Code
- Select code you want explained
- Right-click → "NetPad AI" → "💬 Explain Code" 
- Or use keyboard shortcut: `Ctrl+Alt+E` (Windows/Linux) or `Cmd+Alt+E` (Mac)

#### 3. Refactor Code
- Select code to refactor
- Right-click → "NetPad AI" → "🔧 Refactor Code"
- Or use keyboard shortcut: `Ctrl+Alt+R` (Windows/Linux) or `Cmd+Alt+R` (Mac)

### Advanced Features

#### Data Lineage Extraction
Perfect for understanding data flow in ETL pipelines:

\`\`\`python
# Select this code and run "Extract Data Lineage"
import pandas as pd

raw_data = pd.read_csv('input.csv')
cleaned_data = raw_data.dropna()
result = cleaned_data.groupby('category').sum()
result.to_csv('output.csv')
\`\`\`

#### SQL Metadata Lookup
Analyze SQL queries and database schemas:

\`\`\`sql
-- Select this SQL and run "SQL Metadata Lookup"
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5;
\`\`\`

#### Custom Workflows
Run specialized analysis workflows:

1. Select your code
2. Command Palette → "NetPad: Run Custom Workflow"
3. Enter workflow name (e.g., `security_audit`, `performance_analysis`)

#### Tool Discovery
Explore available NetPad capabilities:

1. Command Palette → "NetPad: Get Available Tools"
2. View the output to see all available tools and their descriptions

## 🧪 Testing

### Run Comprehensive Tests

\`\`\`bash
# Test API connectivity and all features
npm test

# Or run the test script directly
node scripts/testNetPadIntegration.js
\`\`\`

### Manual Testing

1. **Connection Test**: 
   - Command Palette → "NetPad: Get Available Tools"
   - Should show available tools if connection works

2. **Code Analysis Test**:
   - Select any code snippet
   - Run "Analyze Code" command
   - Check NetPad output panel for results

3. **Error Handling Test**:
   - Try commands without selecting code
   - Should show appropriate error messages

## 🛠️ Development

### Project Structure

\`\`\`
netpad-cursor-extension/
├── vscode/                 # VSCode extension
│   ├── src/
│   │   ├── extension.js    # Main extension logic
│   │   └── commands/       # Individual command handlers
│   └── package.json        # VSCode manifest
├── cursor/                 # Cursor extension
│   ├── src/
│   │   └── extension.js    # Cursor-optimized logic
│   └── manifest.json       # Cursor manifest
├── common/                 # Shared utilities
│   └── apiClient.js        # NetPad API client
├── scripts/                # Development scripts
│   └── testNetPadIntegration.js
└── README.md
\`\`\`

### Building from Source

1. **Clone the repository**:
   \`\`\`bash
   git clone https://github.com/mrlynn/netpad-cursor-extensions
   cd netpad-cursor-extension
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment**:
   \`\`\`bash
   cp .env-example .env
   # Edit .env with your API credentials
   \`\`\`

4. **Test the integration**:
   \`\`\`bash
   npm test
   \`\`\`

5. **Package the extension**:
   \`\`\`bash
   # For VSCode
   cd vscode && npm run package
   
   # For Cursor
   cd cursor && npm run package
   \`\`\`

### Development Commands

\`\`\`bash
# Run tests
npm test

# Package for distribution
npm run package

# Development server (if available)
npm run dev

# Lint code
npm run lint
\`\`\`

## 🔧 Troubleshooting

### Common Issues

#### 1. "API key not configured" Error
**Solution**: Set your NetPad API key in settings or environment variables.

#### 2. "No active editor" Error
**Solution**: Make sure you have a file open and code selected.

#### 3. "Connection timeout" Error
**Solutions**:
- Check your internet connection
- Verify the NetPad API URL is correct
- Increase timeout in settings

#### 4. "No output received" Warning
**Solutions**:
- Check if the selected code is valid
- Try with a different code snippet
- Check NetPad service status

### Debug Mode

Enable detailed logging to troubleshoot issues:

1. Set `netpad.enableLogging: true` in settings
2. Open NetPad output panel: View → Output → NetPad
3. Run commands and check the logs

### API Status Check

Test your API connection manually:

\`\`\`bash
curl -H "X-API-Key: your_api_key" \
     -H "Content-Type: application/json" \
     https://netpad.io/api/mcp/tools
\`\`\`

## 📊 Supported Languages

- JavaScript/TypeScript
- Python
- Java
- C#
- C/C++
- Go
- Rust
- PHP
- Ruby
- SQL
- And more...

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Commit your changes: `git commit -am 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/mrlynn/netpad-cursor-extensions/issues)
- **Documentation**: [Wiki](https://github.com/mrlynn/netpad-cursor-extensions/wiki)
- **API Documentation**: [NetPad API Docs](https://netpad.io/docs)

## 🔄 Changelog

### v1.0.0
- Initial release
- Code analysis, explanation, and refactoring
- Data lineage extraction
- SQL metadata analysis
- Custom workflows
- Tool discovery
- Support for both VSCode and Cursor

---

**Made with ❤️ for developers using NetPad AI**
```

# scripts/testCommand.js

```js
import axios from 'axios';

async function run() {
  const response = await axios.post(process.env.NETPAD_API_URL + '/command', {
    type: 'code_analysis',
    input: {
      code: "function hello() { return 'world'; }",
      language: "javascript",
      analysisType: "summary"
    }
  }, {
    headers: {
      'X-API-Key': process.env.NETPAD_API_KEY
    }
  });

  console.log('Response:', response.data);
}

run().catch(console.error);
```

# scripts/testNetPadIntegration.js

```js
// scripts/testNetPadIntegration.js
require('dotenv').config();
const { NetPadApiClient } = require('../common/apiClient');

class NetPadTester {
  constructor() {
    this.client = null;
    this.testResults = [];
  }

  /**
   * Initialize the test environment
   */
  async initialize() {
    console.log('🚀 Initializing NetPad API Tests...\n');

    try {
      this.client = new NetPadApiClient({
        enableLogging: true
      });
      console.log('✅ API client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize API client:', error.message);
      throw error;
    }
  }

  /**
   * Add test result
   */
  addResult(testName, success, message, data = null) {
    this.testResults.push({
      test: testName,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Test connection to NetPad API
   */
  async testConnection() {
    console.log('🔍 Testing API connection...');
    
    try {
      const result = await this.client.testConnection();
      
      if (result.success) {
        console.log('✅ Connection test passed');
        this.addResult('Connection Test', true, 'Successfully connected to NetPad API');
      } else {
        console.log('❌ Connection test failed:', result.message);
        this.addResult('Connection Test', false, result.message);
      }
    } catch (error) {
      console.log('❌ Connection test failed:', error.message);
      this.addResult('Connection Test', false, error.message);
    }
  }

  /**
   * Test fetching available tools
   */
  async testGetTools() {
    console.log('\n🛠️  Testing tool discovery...');
    
    try {
      const result = await this.client.getTools();
      
      if (result && result.tools) {
        console.log(`✅ Found ${result.tools.length} tools:`);
        result.tools.forEach(tool => {
          console.log(`   • ${tool.name}: ${tool.description || 'No description'}`);
        });
        this.addResult('Tool Discovery', true, `Found ${result.tools.length} tools`, result.tools);
      } else {
        console.log('⚠️  No tools found in response');
        this.addResult('Tool Discovery', false, 'No tools found in response');
      }
    } catch (error) {
      console.log('❌ Tool discovery failed:', error.message);
      this.addResult('Tool Discovery', false, error.message);
    }
  }

  /**
   * Test code analysis with different languages and types
   */
  async testCodeAnalysis() {
    console.log('\n📊 Testing code analysis...');

    const testCases = [
      {
        name: 'JavaScript Summary',
        code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
        language: 'javascript',
        analysisType: 'summary'
      },
      {
        name: 'Python Explanation',
        code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
        language: 'python',
        analysisType: 'explanation'
      },
      {
        name: 'SQL Analysis',
        code: `SELECT u.name, COUNT(o.id) as order_count, SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2023-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY total_spent DESC;`,
        language: 'sql',
        analysisType: 'summary'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n   Testing: ${testCase.name}`);
      
      try {
        const result = await this.client.analyzeCode(
          testCase.code,
          testCase.language,
          testCase.analysisType
        );

        if (result && result.output) {
          console.log('   ✅ Analysis successful');
          console.log(`   📄 Output: ${result.output.substring(0, 100)}...`);
          this.addResult(testCase.name, true, 'Code analysis completed', {
            outputLength: result.output.length,
            preview: result.output.substring(0, 200)
          });
        } else {
          console.log('   ⚠️  No output received');
          this.addResult(testCase.name, false, 'No output received from API');
        }
      } catch (error) {
        console.log(`   ❌ Analysis failed: ${error.message}`);
        this.addResult(testCase.name, false, error.message);
      }
    }
  }

  /**
   * Test data lineage extraction
   */
  async testDataLineage() {
    console.log('\n🌐 Testing data lineage extraction...');

    const testCode = `
# Data pipeline example
import pandas as pd
from sqlalchemy import create_engine

# Load data from database
engine = create_engine('postgresql://user:pass@localhost/db')
raw_data = pd.read_sql('SELECT * FROM customers', engine)

# Transform data
cleaned_data = raw_data.dropna()
enriched_data = cleaned_data.merge(
    pd.read_sql('SELECT * FROM orders', engine),
    on='customer_id'
)

# Aggregate
summary = enriched_data.groupby('region').agg({
    'revenue': 'sum',
    'customer_id': 'nunique'
})

# Save results
summary.to_sql('customer_summary', engine, if_exists='replace')
`;

    try {
      const result = await this.client.extractDataLineage(testCode, 'python');
      
      if (result && result.output) {
        console.log('✅ Data lineage extraction successful');
        console.log(`📄 Output: ${result.output.substring(0, 200)}...`);
        this.addResult('Data Lineage', true, 'Data lineage extraction completed', {
          outputLength: result.output.length
        });
      } else {
        console.log('⚠️  No lineage output received');
        this.addResult('Data Lineage', false, 'No output received from API');
      }
    } catch (error) {
      console.log(`❌ Data lineage extraction failed: ${error.message}`);
      this.addResult('Data Lineage', false, error.message);
    }
  }

  /**
   * Test SQL metadata lookup
   */
  async testSqlMetadata() {
    console.log('\n🗄️  Testing SQL metadata lookup...');

    const testSql = `
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO customers (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com');

SELECT name, email FROM customers WHERE created_at > '2023-01-01';
`;

    try {
      const result = await this.client.sqlMetadataLookup(testSql);
      
      if (result && result.output) {
        console.log('✅ SQL metadata lookup successful');
        console.log(`📄 Output: ${result.output.substring(0, 200)}...`);
        this.addResult('SQL Metadata', true, 'SQL metadata lookup completed', {
          outputLength: result.output.length
        });
      } else {
        console.log('⚠️  No metadata output received');
        this.addResult('SQL Metadata', false, 'No output received from API');
      }
    } catch (error) {
      console.log(`❌ SQL metadata lookup failed: ${error.message}`);
      this.addResult('SQL Metadata', false, error.message);
    }
  }

  /**
   * Test custom workflow execution
   */
  async testCustomWorkflow() {
    console.log('\n⚙️  Testing custom workflow...');

    const testCode = `
function processUserData(users) {
    // Security concern: No input validation
    const processed = users.map(user => {
        // Performance issue: Synchronous processing
        return {
            id: user.id,
            name: user.name.toUpperCase(),
            email: user.email.toLowerCase()
        };
    });
    
    // Memory leak: No cleanup
    return processed;
}
`;

    try {
      const result = await this.client.runWorkflow('security_audit', {
        code: testCode,
        language: 'javascript',
        fileName: 'userProcessor.js'
      });
      
      if (result && result.output) {
        console.log('✅ Custom workflow execution successful');
        console.log(`📄 Output: ${result.output.substring(0, 200)}...`);
        this.addResult('Custom Workflow', true, 'Custom workflow completed', {
          outputLength: result.output.length
        });
      } else {
        console.log('⚠️  No workflow output received');
        this.addResult('Custom Workflow', false, 'No output received from API');
      }
    } catch (error) {
      console.log(`❌ Custom workflow failed: ${error.message}`);
      this.addResult('Custom Workflow', false, error.message);
    }
  }

  /**
   * Test error handling with invalid payloads
   */
  async testErrorHandling() {
    console.log('\n🚨 Testing error handling...');

    const errorTests = [
      {
        name: 'Invalid Command Type',
        request: () => this.client.executeCommand('invalid_command', { code: 'test' })
      },
      {
        name: 'Missing Required Fields',
        request: () => this.client.executeCommand('code_analysis', {})
      },
      {
        name: 'Invalid Tool Name',
        request: () => this.client.executeTool('nonexistent_tool', {})
      }
    ];

    for (const errorTest of errorTests) {
      console.log(`\n   Testing: ${errorTest.name}`);
      
      try {
        await errorTest.request();
        console.log('   ⚠️  Expected error but got success');
        this.addResult(errorTest.name, false, 'Expected error but got success');
      } catch (error) {
        console.log(`   ✅ Error handling working: ${error.message}`);
        this.addResult(errorTest.name, true, `Error properly handled: ${error.message}`);
      }
    }
  }

  /**
   * Test payload size limits
   */
  async testPayloadLimits() {
    console.log('\n📏 Testing payload size limits...');

    // Create a large code string
    const largeCode = 'console.log("test");'.repeat(10000);

    try {
      const result = await this.client.analyzeCode(largeCode, 'javascript', 'summary');
      
      if (result && result.output) {
        console.log('✅ Large payload handled successfully');
        this.addResult('Large Payload', true, 'Large payload processed successfully');
      } else {
        console.log('⚠️  Large payload returned no output');
        this.addResult('Large Payload', false, 'No output for large payload');
      }
    } catch (error) {
      if (error.message.includes('413') || error.message.includes('too large')) {
        console.log('✅ Payload limit properly enforced');
        this.addResult('Large Payload', true, 'Payload limit properly enforced');
      } else {
        console.log(`❌ Unexpected error with large payload: ${error.message}`);
        this.addResult('Large Payload', false, error.message);
      }
    }
  }

  /**
   * Generate test report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST REPORT');
    console.log('='.repeat(60));

    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    const total = this.testResults.length;

    console.log(`\n📈 Overall Results: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.success).forEach(result => {
        console.log(`   • ${result.test}: ${result.message}`);
      });
    }

    console.log('\n✅ Passed Tests:');
    this.testResults.filter(r => r.success).forEach(result => {
      console.log(`   • ${result.test}: ${result.message}`);
    });

    return {
      total,
      passed,
      failed,
      results: this.testResults
    };
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    await this.initialize();

    console.log('Starting comprehensive NetPad API tests...\n');

    // Run all test suites
    await this.testConnection();
    await this.testGetTools();
    await this.testCodeAnalysis();
    await this.testDataLineage();
    await this.testSqlMetadata();
    await this.testCustomWorkflow();
    await this.testErrorHandling();
    await this.testPayloadLimits();

    return this.generateReport();
  }
}

// CLI usage
if (require.main === module) {
  const tester = new NetPadTester();
  
  tester.runAllTests()
    .then(report => {
      console.log('\n🎉 Test suite completed!');
      process.exit(report.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = { NetPadTester };
```

# vscode/media/netpad.png

This is a binary file of the type: Image

# vscode/netpad-vscode-1.0.0.vsix

This is a binary file of the type: Binary

# vscode/package.json

```json
{
  "name": "netpad-vscode",
  "displayName": "NetPad",
  "description": "AI-powered code analysis and assistance via NetPad API",
  "version": "1.0.0",
  "publisher": "your-publisher-name",
  "engines": {
    "vscode": "^1.74.0"
  },
  "icon": "media/netpad.png",
  "categories": ["Other", "Machine Learning"],
  "keywords": ["ai", "code-analysis", "mcp", "netpad", "cursor"],
  "activationEvents": [
    "onCommand:netpad.analyzeCode",
    "onCommand:netpad.explainCode",
    "onCommand:netpad.refactorCode",
    "onCommand:netpad.getTools"
  ],
  "main": "./src/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "netpad.analyzeCode",
        "title": "Analyze Code",
        "category": "NetPad",
        "icon": "$(search)"
      },
      {
        "command": "netpad.explainCode", 
        "title": "Explain Code",
        "category": "NetPad",
        "icon": "$(comment-discussion)"
      },
      {
        "command": "netpad.refactorCode",
        "title": "Refactor Code", 
        "category": "NetPad",
        "icon": "$(tools)"
      },
      {
        "command": "netpad.getTools",
        "title": "Get Available Tools",
        "category": "NetPad",
        "icon": "$(list-unordered)"
      },
      {
        "command": "netpad.extractDataLineage",
        "title": "Extract Data Lineage",
        "category": "NetPad",
        "icon": "$(git-branch)"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "command": "netpad.analyzeCode",
          "when": "editorHasSelection",
          "group": "netpad@1"
        },
        {
          "command": "netpad.explainCode",
          "when": "editorHasSelection", 
          "group": "netpad@2"
        },
        {
          "command": "netpad.refactorCode",
          "when": "editorHasSelection",
          "group": "netpad@3"
        },
        {
          "command": "netpad.extractDataLineage",
          "when": "editorHasSelection",
          "group": "netpad@4"
        },
        {
          "separator": "",
          "group": "netpad@5"
        },
        {
          "command": "netpad.getTools",
          "group": "netpad@6"
        }
      ],
      "commandPalette": [
        {
          "command": "netpad.analyzeCode",
          "when": "editorHasSelection"
        },
        {
          "command": "netpad.explainCode",
          "when": "editorHasSelection"
        },
        {
          "command": "netpad.refactorCode", 
          "when": "editorHasSelection"
        },
        {
          "command": "netpad.extractDataLineage",
          "when": "editorHasSelection"
        },
        {
          "command": "netpad.getTools"
        }
      ]
    },
    "configuration": {
      "title": "NetPad",
      "properties": {
        "netpad.apiUrl": {
          "type": "string",
          "default": "https://netpad.io/api/mcp",
          "description": "NetPad API base URL",
          "order": 1
        },
        "netpad.apiKey": {
          "type": "string",
          "default": "",
          "description": "NetPad API key (required for authentication)",
          "order": 2
        },
        "netpad.timeout": {
          "type": "number",
          "default": 30000,
          "description": "Request timeout in milliseconds",
          "minimum": 5000,
          "maximum": 120000,
          "order": 3
        },
        "netpad.enableLogging": {
          "type": "boolean",
          "default": true,
          "description": "Enable detailed logging for debugging",
          "order": 4
        }
      }
    }
  },
  "scripts": {
    "test": "echo \"No tests specified\" && exit 0",
    "package": "vsce package",
    "publish": "vsce publish"
  },
  "dependencies": {
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.74.0",
    "@vscode/vsce": "^2.19.0"
  }
}
```

# vscode/src/commands/analyzeCode.js

```js
const axios = require('axios');

module.exports = async function analyzeCode(code) {
  const response = await axios.post('https://netpad.app/api/mcp/command', {
    type: 'code_analysis',
    input: {
      code,
      language: 'javascript',
      analysisType: 'summary'
    }
  });

  return response.data.output;
};
```

# vscode/src/extension.js

```js
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
```

# vscode/src/utils/outputChannel.js

```js
const vscode = require('vscode');
let channel = null;

function getOutputChannel() {
  if (!channel) {
    channel = vscode.window.createOutputChannel('NetPad');
  }
  return channel;
}

function showOutput(message) {
  const channel = getOutputChannel();
  channel.appendLine(message);
  channel.show();
}

module.exports = { showOutput };
```

