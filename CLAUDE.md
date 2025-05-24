# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NetPad Extensions is a monorepo containing AI-powered code analysis extensions for both VSCode and Cursor editors. The extensions integrate with the NetPad API to provide intelligent code insights, refactoring suggestions, data lineage extraction, and SQL metadata analysis.

## Architecture

### Repository Structure
- `vscode/` - VSCode extension implementation
- `cursor/` - Cursor extension implementation  
- `common/` - Shared API client and utilities
- `scripts/` - Development and testing scripts

### Key Components
- **API Client** (`common/apiClient.js`): Centralized NetPad API communication with retry logic, error handling, and configuration management
- **Extension Logic** (`*/src/extension.js`): Editor-specific command registration and UI integration
- **Command System**: Unified command structure across both editors for code analysis, explanation, refactoring, data lineage extraction, and tool discovery

## Development Commands

### Testing
```bash
# Run comprehensive API integration tests
npm test

# Run test script directly
node scripts/testNetPadIntegration.js
```

### Packaging
```bash
# Package VSCode extension
cd vscode && npm run package

# Package Cursor extension  
cd cursor && npm run package
```

### Development
```bash
# Install dependencies (run in both vscode/ and cursor/ directories)
npm install

# Test API connectivity
node scripts/testCommand.js
```

## Configuration

Both extensions require NetPad API configuration via:
- VS Code settings (`netpad.apiUrl`, `netpad.apiKey`, `netpad.timeout`, `netpad.enableLogging`)
- Environment variables (`NETPAD_API_URL`, `NETPAD_API_KEY`, `NETPAD_TIMEOUT`)
- `.env` file in project root

## Extension Features

### Core Commands
- **Code Analysis**: Comprehensive code analysis with complexity and pattern detection
- **Code Explanation**: Detailed explanations of code functionality
- **Refactoring Suggestions**: Intelligent code improvement recommendations
- **Data Lineage Extraction**: Analysis of data flow in ETL pipelines
- **SQL Metadata Lookup**: Database schema and query analysis
- **Custom Workflows**: Specialized analysis workflows (security audits, performance analysis)
- **Tool Discovery**: Exploration of available NetPad capabilities

### API Integration Patterns
- All commands follow the `/command` endpoint pattern with `type` and `input` parameters
- Custom workflows use the `/workflow/run` endpoint with graph-based execution
- Tool discovery uses the `/tools` endpoint for capability exploration
- Error handling includes retry logic with exponential backoff
- Progress notifications and output channel integration for user feedback

## Common Development Tasks

When modifying extensions:
1. Update both VSCode and Cursor implementations to maintain feature parity
2. Test API integration using `scripts/testNetPadIntegration.js`
3. Verify command registration in both `package.json` (VSCode) and `manifest.json` (Cursor)
4. Ensure error handling and user feedback consistency
5. Update configuration schemas if adding new settings

When adding new commands:
1. Add to both extension manifests
2. Implement in both extension files
3. Add menu entries and keyboard shortcuts
4. Include in comprehensive test suite
5. Update documentation examples