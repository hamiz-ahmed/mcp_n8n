# MCP Client with OpenAI Integration

A Node.js client designed to connect with **n8n Workflow MCP servers** via SSE (Server-Sent Events) and integrates with OpenAI for intelligent tool calling. This client connects to n8n's Model Context Protocol (MCP) server of a custom workflow and uses OpenAI to intelligently call available tools based on user queries.

## 🚀 Features

- **MCP Server Integration**: Connects to MCP servers via SSE transport
- **OpenAI Integration**: Uses OpenAI's function calling to intelligently use MCP tools
- **Automatic Tool Discovery**: Automatically discovers and lists available tools from the MCP server
- **Interactive Chat Mode**: Continuous conversation with the agent
- **Single Query Mode**: Run one-off queries from the command line
- **TypeScript-Ready**: Written in modern ES modules

## 📋 Prerequisites

- Node.js 18+ (with npm)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Access to an n8n MCP server with SSE endpoint

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mcp_n8n
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your configuration:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   MCP_SERVER_URL=https://your-n8n-mcp-server.com/sse
   ```
   
   **Note**: This client is designed to work with n8n MCP servers. Make sure your MCP server URL points to an n8n MCP server endpoint.

## 🎯 Usage

### Interactive Chat Mode

Start an interactive chat session where you can have a continuous conversation:

```bash
npm run chat
```

**Commands:**
- Type your questions normally
- Type `clear` to reset the conversation history
- Type `quit` or `exit` to end the session

**Example:**
```bash
$ npm run chat

🚀 Starting Interactive MCP Chat

🔌 Connecting to MCP server: https://your-n8n-mcp-server.com/sse
✅ Connected to MCP server
📦 Discovered 2 tool(s):
   - tool_name_1: Description of tool 1
   - tool_name_2: Description of tool 2

============================================================
🤖 Interactive Chat Ready!
   Type your questions to query the MCP server
   Commands: 'quit' or 'exit' to end, 'clear' to reset
============================================================

You: What information can you find?
```

### Single Query Mode

Run a one-off query from the command line:

```bash
npm start "Your question here"
```

**Example:**
```bash
npm start "What tools are available and what can they do?"
```

## 📁 Project Structure

```
mcp_n8n/
├── mcp-client.js      # Core MCP client with SSE transport
├── openai-agent.js    # OpenAI integration for tool calling
├── index.js           # Single query entry point
├── chat.js            # Interactive chat entry point
├── package.json       # Project dependencies
├── .env.example       # Environment variables template
└── README.md          # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes | - |
| `MCP_SERVER_URL` | n8n MCP server SSE endpoint URL | Yes | - |

### OpenAI Model

You can change the OpenAI model in `index.js` or `chat.js`:

```javascript
const agent = new OpenAIAgent(mcpClient, {
  model: "gpt-4o", // or "gpt-4o-mini" for faster/cheaper
  // ...
});
```

Available models:
- `gpt-4o` - Most capable, best for complex queries
- `gpt-4o-mini` - Faster and cheaper, good for most use cases
- `gpt-4-turbo` - Alternative option

## 🏗️ Architecture

### How It Works

1. **Connection**: The client connects to the MCP server via SSE transport
2. **Tool Discovery**: On connection, it automatically discovers available tools
3. **Query Processing**: 
   - User sends a query
   - OpenAI receives the query + available MCP tools
   - OpenAI decides if/when to call tools
   - Tool calls are executed on the MCP server
   - Results are sent back to OpenAI
   - OpenAI generates the final response

### Components

- **MCPClient** (`mcp-client.js`): Handles MCP server connection, tool discovery, and tool execution
- **OpenAIAgent** (`openai-agent.js`): Manages conversation with OpenAI, handles tool calling, and maintains conversation history

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check the MCP documentation: https://modelcontextprotocol.io

## 🔗 About n8n MCP Servers

This client is specifically designed to work with **n8n MCP servers**. n8n is a workflow automation platform that can expose MCP servers via SSE endpoints, allowing you to interact with n8n workflows and automations through the Model Context Protocol.

To use this client:
1. Set up an n8n MCP server (check n8n documentation for MCP server setup)
2. Obtain the SSE endpoint URL from your n8n instance
3. Configure the `MCP_SERVER_URL` environment variable with your n8n MCP server URL

## 🙏 Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol)
- Powered by [OpenAI](https://openai.com)
- Designed for [n8n](https://n8n.io) MCP servers

