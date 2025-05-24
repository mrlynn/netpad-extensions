# 🚀 NetPad Extensions: AI-Powered Code Intelligence for Every Editor

<div align="center">

![NetPad Logo](https://github.com/mrlynn/netpad-cursor-extensions/raw/main/cursor/media/netpad.png)

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/mrlynn/netpad-cursor-extensions)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Cursor](https://img.shields.io/badge/Cursor-Ready-purple.svg)](https://cursor.sh)
[![VSCode](https://img.shields.io/badge/VSCode-Coming%20Soon-lightgrey.svg)](https://code.visualstudio.com/)
[![NetPad](https://img.shields.io/badge/Powered%20by-NetPad%20AI-orange.svg)](https://netpad.io)

*Supercharge your coding workflow with intelligent analysis, refactoring, and data lineage insights—right inside your favorite editor!*

[🔗 Get API Access](https://netpad.io) • [📖 Documentation](https://github.com/mrlynn/netpad-cursor-extensions/wiki) • [🐛 Report Issues](https://github.com/mrlynn/netpad-cursor-extensions/issues)

</div>

---

## ✨ What is NetPad Extensions?

**NetPad Extensions** is a suite of next-generation, AI-powered code intelligence tools for modern code editors. Whether you use Cursor, VSCode, or another editor (coming soon!), NetPad brings deep code analysis, enterprise-grade data lineage, and smart refactoring to your fingertips.

- **Multi-Editor Support**: Cursor (now), VSCode (coming soon), and more planned
- **Unified Experience**: Consistent, powerful features across all supported editors
- **Enterprise-Ready**: Built for professional teams and individual developers alike

---

## 🌟 Features at a Glance

<table>
<tr>
<td width="50%">

### 🔍 **Intelligent Code Analysis**
- Context-aware insights
- Multi-language support
- Performance & security auditing

</td>
<td width="50%">

### 🌐 **Data Lineage Extraction**
- ETL/data pipeline mapping
- Database dependency analysis
- API data flow & compliance

</td>
</tr>
<tr>
<td>

### 🔧 **Smart Refactoring**
- Architecture-aware suggestions
- Performance optimizations
- Code quality enhancement

</td>
<td>

### 🗄️ **SQL Intelligence**
- Query optimization
- Schema analysis
- Migration planning

</td>
</tr>
</table>

---

## 🖥️ Supported Editors

| Editor  | Status        | Details |
|---------|--------------|---------|
| **Cursor** | ✅ Available | [See Cursor README](./cursor/README.md) |
| **VSCode** | 🚧 Coming Soon | [See VSCode README](./vscode/README.md) |
| **Other Editors** | 🛠️ Planned | Stay tuned! |

---

## 💡 Real-World Use Cases

<details>
<summary><strong>📊 Data Pipeline Analysis</strong></summary>

```python
# Select this ETL code and use "Extract Data Lineage"
import pandas as pd
from sqlalchemy import create_engine

# Extract
data = pd.read_sql("SELECT * FROM customers", engine)
# ...
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

## 🏗️ Project Structure

```
netpad-extensions/
├── common/      # Shared utilities
├── cursor/      # Cursor extension (production ready)
├── vscode/      # VSCode extension (coming soon)
├── scripts/     # Dev/test scripts
├── README.md    # This file
└── ...
```

- **[cursor/README.md](./cursor/README.md)**: Full details for Cursor users
- **[vscode/README.md](./vscode/README.md)**: VSCode instructions (coming soon)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

**Quick Start:**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure tests pass: `npm test`
5. Submit a pull request

---

## 📞 Support & Community

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/mrlynn/netpad-cursor-extensions/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/mrlynn/netpad-cursor-extensions/discussions)
- **📖 Documentation**: [Project Wiki](https://github.com/mrlynn/netpad-cursor-extensions/wiki)
- **🆘 General Help**: [NetPad Support](https://netpad.io/support)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

## 🌟 **Ready to Supercharge Your Coding?**

### [🚀 Get Started with NetPad](https://netpad.io)

*Transform your development workflow with AI-powered code intelligence*

**Made with ❤️ for the developer community**

</div>