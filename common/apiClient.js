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