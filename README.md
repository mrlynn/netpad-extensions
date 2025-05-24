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
   ```
   > Extensions: Install from VSIX...
   ```
3. Configure your API credentials (see Configuration section)

### Cursor Extension

1. Clone this repository
2. Navigate to the `cursor/` directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Package the extension:
   ```bash
   npm run package
   ```
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

```bash
NETPAD_API_URL=https://netpad.io/api/mcp
NETPAD_API_KEY=your_api_key_here
NETPAD_TIMEOUT=30000
NETPAD_ENABLE_LOGGING=true
```

### Method 3: Settings.json

Add to your VS Code `settings.json`:

```json
{
  "netpad.apiUrl": "https://netpad.io/api/mcp",
  "netpad.apiKey": "your_api_key_here",
  "netpad.timeout": 30000,
  "netpad.enableLogging": true
}
```

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

```python
# Select this code and run "Extract Data Lineage"
import pandas as pd

raw_data = pd.read_csv('input.csv')
cleaned_data = raw_data.dropna()
result = cleaned_data.groupby('category').sum()
result.to_csv('output.csv')
```

#### SQL Metadata Lookup
Analyze SQL queries and database schemas:

```sql
-- Select this SQL and run "SQL Metadata Lookup"
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5;
```

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

```bash
# Test API connectivity and all features
npm test

# Or run the test script directly
node scripts/testNetPadIntegration.js
```

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

```
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
```

### Building from Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mrlynn/netpad-cursor-extensions
   cd netpad-cursor-extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env-example .env
   # Edit .env with your API credentials
   ```

4. **Test the integration**:
   ```bash
   npm test
   ```

5. **Package the extension**:
   ```bash
   # For VSCode
   cd vscode && npm run package
   
   # For Cursor
   cd cursor && npm run package
   ```

### Development Commands

```bash
# Run tests
npm test

# Package for distribution
npm run package

# Development server (if available)
npm run dev

# Lint code
npm run lint
```

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

```bash
curl -H "X-API-Key: your_api_key" \
     -H "Content-Type: application/json" \
     https://netpad.io/api/mcp/tools
```

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