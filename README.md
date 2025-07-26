# GitResume - AI-Powered Resume Generator for Developers

<p align="center">
  <img src="https://img.shields.io/badge/VSCode-Extension-blue?style=for-the-badge&logo=visual-studio-code" alt="VSCode Extension">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/TypeScript-Powered-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
</p>

Transform your Git commits into professional resume bullet points using AI! GitResume analyzes your code contributions and generates impactful, achievement-focused resume content tailored for tech roles.

## ✨ Features

- 🔍 **Smart Git Analysis** - Automatically analyzes your Git commits and code changes
- 🤖 **AI-Powered Generation** - Uses OpenAI's GPT models to create professional bullet points
- 🎯 **Personalized Results** - Filters commits by your email to focus on your contributions
- 🎨 **Multiple Writing Styles** - Choose from Professional, Technical, Startup, or Academic styles
- 📋 **Easy Export** - Copy to clipboard or save as Markdown/Text files
- ⚡ **Fast & Efficient** - Analyzes your last 50 commits for quick results
- 🔒 **Privacy-First** - Your code is only sent to OpenAI for processing, nothing is stored

## 📸 Screenshots

![GitResume Demo](https://via.placeholder.com/800x400?text=GitResume+Demo)

## 🚀 Quick Start

### Installation

1. **From VSCode Marketplace** (Recommended)
   - Open VSCode
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "GitResume"
   - Click Install

2. **From VSIX file**
   ```bash
   code --install-extension gitresume-0.0.1.vsix
   ```

### Setup

1. **Configure OpenAI API Key**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "GitResume: Configure API Key"
   - Enter your OpenAI API key
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

2. **Generate Resume Points**
   - Open any Git repository in VSCode
   - Press `Ctrl+Shift+P`
   - Type "GitResume: Generate Resume Points"
   - Follow the prompts

## 🎯 Usage Examples

### Basic Usage
1. Open your project in VSCode
2. Run the command: `GitResume: Generate Resume Points`
3. Confirm or enter your Git email
4. Wait 10-30 seconds for AI generation
5. View and copy your resume bullets!

### Advanced Configuration
Configure GitResume through VSCode settings:

```json
{
  "gitresume.openaiApiKey": "sk-...",
  "gitresume.model": "gpt-4o-mini",
  "gitresume.maxBullets": 10,
  "gitresume.style": "professional"
}
```

## ⚙️ Configuration Options

| Setting | Description | Default | Options |
|---------|-------------|---------|---------|
| `gitresume.openaiApiKey` | Your OpenAI API key | `""` | Any valid OpenAI key |
| `gitresume.model` | AI model to use | `"gpt-4o-mini"` | `"gpt-4o-mini"` |
| `gitresume.maxBullets` | Maximum bullets to generate | `10` | 1-50 |
| `gitresume.style` | Writing style | `"professional"` | `"professional"`, `"technical"`, `"startup"`, `"academic"` |

### Writing Styles Explained

- **Professional**: Formal, achievement-focused language for corporate environments
- **Technical**: Emphasizes technical depth, tools, and implementation details
- **Startup**: Highlights innovation, versatility, and rapid development
- **Academic**: Focuses on algorithms, research aspects, and theoretical contributions

## 📝 Example Output

Here's what GitResume generates from your commits:

```
1. Developed RESTful API endpoints using Node.js and Express, reducing average response time by 40% through optimized database queries
   Tags: nodejs, api, performance
   Confidence: 95%

2. Implemented comprehensive unit testing suite with Jest, achieving 90% code coverage and reducing production bugs by 60%
   Tags: testing, jest, quality
   Confidence: 92%

3. Refactored legacy authentication system to use JWT tokens, enhancing security and enabling seamless single sign-on across services
   Tags: security, authentication, jwt
   Confidence: 90%
```

## 🔧 Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `GitResume: Generate Resume Points` | Analyze repository and generate bullets | - |
| `GitResume: Configure API Key` | Set or update your OpenAI API key | - |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/gitresume-vscode
cd gitresume-vscode

# Install dependencies
npm install

# Compile
npm run compile

# Run tests
npm test

# Open in VSCode
code .
# Press F5 to run the extension in a new VSCode window
```

### Building from Source

```bash
# Install vsce
npm install -g @vscode/vsce

# Package extension
vsce package

# This creates gitresume-0.0.1.vsix
```

## 🐛 Troubleshooting

### "OpenAI API key not configured"
- Run `GitResume: Configure API Key` command
- Make sure your API key starts with `sk-`
- Check your OpenAI account has available credits

### "No commits found for this email"
- Verify your Git email: `git config user.email`
- Make sure you have commits in the current branch
- The extension analyzes the last 50 commits

### Slow generation
- First-time analysis can take 30+ seconds
- Depends on repository size and commit history
- Consider reducing the number of commits analyzed

### Extension not working after update
1. Reload VSCode window: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Reinstall the extension
3. Check the Output panel for error messages

## 📊 Privacy & Security

- **Local Analysis**: Git analysis happens entirely on your machine
- **API Communication**: Only code snippets are sent to OpenAI for processing
- **No Storage**: No data is stored on external servers
- **Secure Keys**: API keys are stored in VSCode's secure storage
- **Open Source**: Full source code available for review

## 🚀 Roadmap

- [ ] Support for multiple AI providers (Anthropic, Google)
- [ ] Commit message improvement suggestions
- [ ] Integration with LinkedIn profile updates
- [ ] Batch processing for multiple repositories
- [ ] Custom prompt templates
- [ ] Export to different resume formats (JSON, PDF)
- [ ] Team contribution analysis

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [simple-git](https://github.com/steveukx/git-js) for Git operations
- Powered by [OpenAI](https://openai.com) for AI generation
- Inspired by developers who struggle with resume writing

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/gitresume-vscode/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gitresume-vscode/discussions)
- **Email**: your.email@example.com

## 🌟 Show Your Support

If GitResume helps you land your dream job, consider:
- ⭐ Starring the repository
- 📝 Writing a review on VSCode Marketplace
- 🐦 Sharing on social media
- ☕ [Buying me a coffee](https://buymeacoffee.com/yourusername)

---

<p align="center">Made with ❤️ by developers, for developers</p>
<p align="center">Transform your commits into career opportunities!</p>