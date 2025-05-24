# 🚀 NetPad for Cursor

<div align="center">

![NetPad Logo](https://github.com/mrlynn/netpad-cursor-extensions/raw/main/cursor/media/netpad.png)

**AI-Powered Code Intelligence for Cursor IDE**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/mrlynn/netpad-cursor-extensions)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Cursor](https://img.shields.io/badge/Cursor-Ready-purple.svg)](https://cursor.sh)
[![NetPad](https://img.shields.io/badge/Powered%20by-NetPad%20AI-orange.svg)](https://netpad.io)

*Supercharge your coding workflow with intelligent analysis, refactoring, and data lineage insights*

[🔗 Get API Access](https://netpad.io) • [📖 Documentation](https://github.com/mrlynn/netpad-cursor-extensions/wiki) • [🐛 Report Issues](https://github.com/mrlynn/netpad-cursor-extensions/issues)

</div>

---

## ✨ Why NetPad for Cursor?

NetPad transforms your Cursor IDE into an **AI-powered development powerhouse**. Unlike generic AI assistants, NetPad specializes in deep code analysis, enterprise-grade data lineage extraction, and intelligent refactoring suggestions that understand your codebase's context.

### 🎯 **Perfect for Modern Developers**
- **Data Engineers**: Extract lineage from complex ETL pipelines
- **Backend Developers**: Analyze API patterns and database interactions  
- **DevOps Engineers**: Understand infrastructure-as-code dependencies
- **Full-Stack Teams**: Get intelligent refactoring for any language

---

## 🌟 Features That Set Us Apart

<table>
<tr>
<td width="50%">

### 🔍 **Intelligent Code Analysis**
- **Context-Aware Insights**: Understands your code's purpose, not just syntax
- **Multi-Language Support**: JavaScript, Python, Java, C#, SQL, and more
- **Performance Analysis**: Identify bottlenecks and optimization opportunities
- **Security Auditing**: Spot potential vulnerabilities and security issues

</td>
<td width="50%">

### 🌐 **Data Lineage Extraction**
- **ETL Pipeline Mapping**: Visualize data flow through transformations
- **Database Dependency Analysis**: Understand table relationships
- **API Data Flow**: Track data through microservices
- **Compliance Ready**: Generate reports for data governance

</td>
</tr>
<tr>
<td>

### 🔧 **Smart Refactoring**
- **Architecture-Aware Suggestions**: Improvements that fit your patterns
- **Performance Optimizations**: Speed up your code intelligently
- **Code Quality Enhancement**: Improve maintainability and readability
- **Best Practice Enforcement**: Follow industry standards automatically

</td>
<td>

### 🗄️ **SQL Intelligence**
- **Query Optimization**: Make your databases faster
- **Schema Analysis**: Understand complex table relationships
- **Migration Planning**: Safe database evolution strategies
- **Index Recommendations**: Optimize query performance

</td>
</tr>
</table>

---

## 🚀 Quick Start

### 1️⃣ **Installation**

**Option A: From VSIX (Recommended)**
```bash
# Download the latest release
curl -L https://github.com/mrlynn/netpad-cursor-extensions/releases/latest/download/netpad-cursor-1.0.0.vsix -o netpad-cursor.vsix

# Install in Cursor
# Cmd/Ctrl + Shift + P → "Extensions: Install from VSIX..." → Select the file
```

**Option B: From Source**
```bash
git clone https://github.com/mrlynn/netpad-cursor-extensions.git
cd netpad-cursor-extensions/cursor
npm install
npm run package
# Install the generated .vsix file in Cursor
```

### 2️⃣ **Get Your NetPad API Key**
1. Visit [netpad.io](https://netpad.io) and create your account
2. Generate your API key from the dashboard
3. Keep it handy for the next step!

### 3️⃣ **Configure the Extension**
```json
// In Cursor Settings (Cmd/Ctrl + ,)
{
  "netpad.apiUrl": "https://netpad.io/api/mcp",
  "netpad.apiKey": "your_api_key_here",
  "netpad.enableLogging": true
}
```

### 4️⃣ **Start Analyzing!**
- Select any code → Right-click → **NetPad AI** → Choose your action
- Or use **Command Palette** (`Cmd/Ctrl + Shift + P`) → Type "NetPad"

---

## 💡 Real-World Use Cases

<details>
<summary><strong>📊 Data Pipeline Analysis</strong></summary>

```python
# Select this ETL code and use "Extract Data Lineage"
import pandas as pd
from sqlalchemy import create_engine

# Extract
raw_customers = pd.read_sql("SELECT * FROM customers", engine)
raw_orders = pd.read_sql("SELECT * FROM orders", engine)

# Transform
cleaned_customers = raw_customers.dropna()
enriched_data = cleaned_customers.merge(raw_orders, on='customer_id')
monthly_revenue = enriched_data.groupby(['year', 'month']).revenue.sum()

# Load
monthly_revenue.to_sql('revenue_summary', engine, if_exists='replace')
```

**NetPad will generate:**
- Complete data lineage diagram
- Table dependency mapping
- Transformation impact analysis
- Performance optimization suggestions

</details>

<details>
<summary><strong>🔧 Legacy Code Refactoring</strong></summary>

```javascript
// Select this code and use "Refactor Code"
function processUserData(users) {
    var result = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].status == 'active') {
            result.push({
                id: users[i].id,
                name: users[i].firstName + ' ' + users[i].lastName,
                email: users[i].email.toLowerCase()
            });
        }
    }
    return result;
}
```

**NetPad suggests:**
- Modern ES6+ syntax improvements
- Performance optimizations
- Type safety enhancements
- Error handling best practices

</details>

<details>
<summary><strong>🗃️ SQL Query Optimization</strong></summary>

```sql
-- Select this query and use "SQL Metadata Lookup"
SELECT u.name, COUNT(o.id) as order_count, SUM(o.total) as revenue
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2023-01-01'
  AND u.status = 'active'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY revenue DESC;
```

**NetPad provides:**
- Index recommendations
- Query execution plan analysis
- Schema relationship insights
- Performance optimization tips

</details>

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| **Analyze Code** | `Ctrl/Cmd + Alt + A` | Deep analysis of selected code |
| **Explain Code** | `Ctrl/Cmd + Alt + E` | Get detailed code explanations |
| **Refactor Code** | `Ctrl/Cmd + Alt + R` | Smart refactoring suggestions |

*💡 Tip: All commands also available via right-click context menu and Command Palette*

---

## 🎨 Cursor IDE Integration

### **Seamless Workflow Integration**
- **Context Menus**: Right-click any code for instant analysis
- **Command Palette**: Quick access to all NetPad features
- **Output Panel**: Beautifully formatted results with syntax highlighting
- **Progress Indicators**: Real-time feedback during analysis
- **Settings Integration**: Native Cursor settings panel support

### **Optimized for Cursor's AI Features**
- **Complements Cursor's AI**: Works alongside Cursor's built-in AI features
- **Enhanced Context**: Provides deeper analysis than general AI assistants
- **Specialized Workflows**: Purpose-built for code analysis and data work
- **Enterprise Features**: Advanced capabilities for professional development

---

## ⚙️ Advanced Configuration

<details>
<summary><strong>🔧 Complete Settings Reference</strong></summary>

```json
{
  // API Configuration
  "netpad.apiUrl": "https://netpad.io/api/mcp",
  "netpad.apiKey": "your_api_key_here",
  "netpad.timeout": 30000,
  
  // UI Preferences  
  "netpad.enableLogging": true,
  "netpad.showProgressNotifications": true,
  "netpad.autoDetectLanguage": true,
  
  // Analysis Defaults
  "netpad.defaultAnalysisType": "comprehensive"
}
```

</details>

<details>
<summary><strong>🌍 Environment Variables</strong></summary>

```bash
# Alternative configuration via environment
export NETPAD_API_URL="https://netpad.io/api/mcp"
export NETPAD_API_KEY="your_api_key_here"
export NETPAD_TIMEOUT="30000"
export NETPAD_ENABLE_LOGGING="true"
```

</details>

<details>
<summary><strong>🔐 Enterprise Setup</strong></summary>

For enterprise deployments with custom NetPad instances:

```json
{
  "netpad.apiUrl": "https://your-company.netpad.internal/api/mcp",
  "netpad.apiKey": "enterprise_api_key",
  "netpad.timeout": 60000,
  "netpad.enableLogging": false
}
```

</details>

---

## 🛠️ Troubleshooting

### **Common Issues & Solutions**

<details>
<summary><strong>❌ "Command 'netpad.getTools' not found"</strong></summary>

**Cause**: Extension didn't activate properly

**Solutions**:
1. **Reload Cursor**: `Cmd/Ctrl + Shift + P` → "Developer: Reload Window"
2. **Check Installation**: Ensure extension appears in Extensions panel
3. **Verify Settings**: Confirm API key is set correctly
4. **Check Console**: `Help` → `Toggle Developer Tools` → Look for errors

</details>

<details>
<summary><strong>⚠️ "NetPad API key not configured"</strong></summary>

**Cause**: Missing or incorrect API credentials

**Solutions**:
1. **Get API Key**: Visit [netpad.io](https://netpad.io) and create account
2. **Add to Settings**: `Cmd/Ctrl + ,` → Search "netpad" → Set API key
3. **Environment Variable**: Set `NETPAD_API_KEY` in your shell
4. **Reload Extension**: Restart Cursor after configuration

</details>

<details>
<summary><strong>🔄 "Connection timeout" Errors</strong></summary>

**Cause**: Network or API availability issues

**Solutions**:
1. **Check Internet**: Verify connection to netpad.io
2. **Increase Timeout**: Set `"netpad.timeout": 60000` in settings
3. **Verify API URL**: Ensure correct endpoint configuration
4. **Enterprise Users**: Check firewall/proxy settings

</details>

<details>
<summary><strong>📊 "No tools available" Warning</strong></summary>

**Cause**: API connectivity or account access issues

**Solutions**:
1. **Verify Account**: Check NetPad dashboard for active subscription
2. **Test Connection**: Use "NetPad: Get Available Tools" command
3. **Check Logs**: Enable logging and review output panel
4. **Contact Support**: Reach out via GitHub issues

</details>

---

## 🏗️ Development & Contributing

### **Building from Source**

```bash
# Clone repository
git clone https://github.com/mrlynn/netpad-cursor-extensions.git
cd netpad-cursor-extensions/cursor

# Install dependencies
npm install

# Run tests
npm test

# Package extension
npm run package

# Install locally
# Cmd/Ctrl + Shift + P → "Extensions: Install from VSIX..."
```

### **Contributing Guidelines**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

**Quick Start for Contributors**:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure tests pass: `npm test`
5. Submit a pull request

### **Extension Architecture**

```
cursor/
├── src/
│   └── extension.js          # Main extension logic
├── media/
│   └── netpad.png           # Extension icon
├── package.json             # Extension manifest
├── manifest.json            # Alternative manifest (deprecated)
└── README.md               # This file
```

---

## 📞 Support & Community

<div align="center">

### **Get Help & Stay Connected**

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?logo=github)](https://github.com/mrlynn/netpad-cursor-extensions/issues)
[![Documentation](https://img.shields.io/badge/Docs-Wiki-blue?logo=gitbook)](https://github.com/mrlynn/netpad-cursor-extensions/wiki)
[![NetPad Support](https://img.shields.io/badge/NetPad-Support-orange?logo=chat)](https://netpad.io/support)

</div>

### **Support Channels**

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/mrlynn/netpad-cursor-extensions/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/mrlynn/netpad-cursor-extensions/discussions)
- **📖 Documentation**: [Project Wiki](https://github.com/mrlynn/netpad-cursor-extensions/wiki)
- **🆘 General Help**: [NetPad Support](https://netpad.io/support)

### **Response Times**
- **Critical Issues**: 24 hours
- **Bug Reports**: 2-3 business days  
- **Feature Requests**: 1 week
- **General Questions**: 1-2 business days

---

## 📋 Changelog

### **v1.0.0** - *Initial Release*

#### ✨ **New Features**
- **Core Commands**: Analyze, Explain, Refactor code
- **Data Lineage**: Extract data flow from ETL pipelines
- **SQL Intelligence**: Metadata analysis and optimization
- **Custom Workflows**: Extensible analysis framework
- **Cursor Integration**: Native IDE integration with context menus

#### 🔧 **Technical Improvements**
- **Robust Error Handling**: Graceful degradation on API failures
- **Configuration Management**: Multiple setup options
- **Progress Indicators**: Real-time feedback during operations
- **Logging System**: Comprehensive debugging capabilities

#### 🎨 **User Experience**
- **Intuitive UI**: Context menus and command palette integration
- **Keyboard Shortcuts**: Quick access to common operations
- **Output Formatting**: Beautiful, readable analysis results
- **Settings Panel**: Native Cursor settings integration

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **What this means for you**:
- ✅ **Commercial Use**: Use in commercial projects
- ✅ **Modification**: Modify the source code
- ✅ **Distribution**: Share with others
- ✅ **Private Use**: Use for personal projects
- ❗ **Warranty**: No warranty provided (use at your own risk)
- 📝 **Attribution**: Include license in distributions

---

<div align="center">

## 🌟 **Ready to Supercharge Your Coding?**

### [🚀 Get Started with NetPad for Cursor](https://netpad.io)

*Transform your development workflow with AI-powered code intelligence*

**Made with ❤️ for the Cursor community**

[![Star on GitHub](https://img.shields.io/github/stars/mrlynn/netpad-cursor-extensions?style=social)](https://github.com/mrlynn/netpad-cursor-extensions)
[![Follow @NetPadAI](https://img.shields.io/twitter/follow/NetPadAI?style=social)](https://twitter.com/NetPadAI)

</div>