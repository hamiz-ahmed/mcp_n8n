import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

/**
 * MCP Client that connects to an SSE-based MCP server
 */
export class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.client = null;
    this.transport = null;
    this.tools = [];
  }

  /**
   * Connect to the MCP server
   */
  async connect() {
    console.log(`🔌 Connecting to MCP server: ${this.serverUrl}`);

    // Create SSE transport
    this.transport = new SSEClientTransport(new URL(this.serverUrl));

    // Create MCP client
    this.client = new Client(
      {
        name: "mcp-openai-client",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Connect to the server
    await this.client.connect(this.transport);
    console.log("✅ Connected to MCP server");

    // Discover available tools
    await this.discoverTools();

    return this;
  }

  /**
   * Discover and list available tools from the MCP server
   */
  async discoverTools() {
    try {
      const response = await this.client.listTools();
      this.tools = response.tools || [];
      console.log(`📦 Discovered ${this.tools.length} tool(s):`);
      this.tools.forEach((tool) => {
        console.log(`   - ${tool.name}: ${tool.description || "No description"}`);
      });
      return this.tools;
    } catch (error) {
      console.error("Failed to discover tools:", error.message);
      return [];
    }
  }

  /**
   * Get tools in OpenAI function calling format
   */
  getToolsForOpenAI() {
    return this.tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description || `Tool: ${tool.name}`,
        parameters: tool.inputSchema || {
          type: "object",
          properties: {},
        },
      },
    }));
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(toolName, args = {}) {
    console.log(`🔧 Calling tool: ${toolName}`);
    console.log(`   Arguments:`, JSON.stringify(args, null, 2));

    try {
      const result = await this.client.callTool({
        name: toolName,
        arguments: args,
      });

      console.log(`✅ Tool response received`);
      return result;
    } catch (error) {
      console.error(`❌ Tool call failed:`, error.message);
      throw error;
    }
  }

  /**
   * Close the connection
   */
  async close() {
    if (this.transport) {
      await this.transport.close();
      console.log("🔌 Connection closed");
    }
  }
}

export default MCPClient;

