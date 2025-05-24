# Contributing to NetPad for Cursor

We love your input! We want to make contributing to NetPad for Cursor as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start for Contributors

### Prerequisites
- Node.js (v16 or higher)
- Cursor IDE
- Git

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/netpad-cursor-extensions.git
cd netpad-cursor-extensions/cursor

# Install dependencies
npm install

# Run tests
npm test

# Package for testing
npm run package
```

## 🐛 Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/mrlynn/netpad-cursor-extensions/issues/new); it's that easy!

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS, Windows, Linux]
 - Cursor Version: [e.g. 0.22.0]
 - Extension Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

## 💡 Suggesting Features

We use GitHub issues to track feature requests as well. When suggesting a feature:

1. **Check existing issues** to see if it's already been suggested
2. **Describe the problem** your feature would solve
3. **Describe the solution** you'd like to see
4. **Consider alternatives** - what other solutions have you considered?

## 🔧 Contributing Code

### Our Development Process

We use GitHub flow, so all code changes happen through pull requests:

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

### Pull Request Process

1. Update the README.md with details of changes to the interface
2. Update the version numbers in any examples files and the README.md to the new version
3. You may merge the Pull Request in once you have the sign-off of two other developers

### Code Style

- We use ESLint for JavaScript linting
- Follow existing code patterns and conventions
- Add comments for complex logic
- Use descriptive variable and function names

## 📋 Coding Standards

### JavaScript/Node.js Guidelines

- Use `const` and `let` instead of `var`
- Use meaningful variable names
- Write JSDoc comments for public functions
- Handle errors gracefully
- Use async/await instead of callbacks when possible

### Extension Development Guidelines

- Follow VS Code extension best practices
- Handle activation/deactivation properly
- Provide good error messages to users
- Test with different API states (configured/not configured)
- Consider performance impact of operations

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run integration tests with NetPad API
npm run test:integration

# Test extension packaging
npm run package
```

### Test Guidelines

- Write tests for new functionality
- Update tests when changing existing functionality
- Test both success and failure scenarios
- Include integration tests for API interactions

## 📚 Documentation

### Documentation Standards

- Keep README.md up to date
- Document new configuration options
- Include examples for new features
- Update CHANGELOG.md for releases

### JSDoc Standards

```javascript
/**
 * Analyzes the provided code using NetPad API
 * @param {string} code - The code to analyze
 * @param {string} language - Programming language of the code
 * @param {string} [analysisType='summary'] - Type of analysis to perform
 * @returns {Promise<Object>} Analysis results from NetPad
 * @throws {Error} When API request fails
 */
async function analyzeCode(code, language, analysisType = 'summary') {
    // Implementation
}
```

## 🏷️ Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/mrlynn/netpad-cursor-extensions/tags).

### Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release notes
4. Tag the release
5. Build and publish extension package

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🆘 Getting Help

- Join our [GitHub Discussions](https://github.com/mrlynn/netpad-cursor-extensions/discussions)
- Check the [Wiki](https://github.com/mrlynn/netpad-cursor-extensions/wiki) for detailed guides
- Open an [issue](https://github.com/mrlynn/netpad-cursor-extensions/issues) for bugs or questions

## 👥 Code of Conduct

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances.

## 🙏 Recognition

Contributors who make significant improvements will be:

- Added to the Contributors section in README.md
- Mentioned in release notes
- Given credit in the extension's About section

Thank you for contributing to NetPad for Cursor! 🎉