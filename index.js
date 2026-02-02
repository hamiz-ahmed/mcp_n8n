import "dotenv/config";
import { MCPClient } from "./mcp-client.js";
import { OpenAIAgent } from "./openai-agent.js";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL;

async function main() {
  console.log("🚀 Starting MCP Client with OpenAI Integration\n");

  // Check for required environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Error: OPENAI_API_KEY environment variable is not set");
    console.log("   Please set it: export OPENAI_API_KEY=your_key_here");
    console.log("   Or create a .env file with OPENAI_API_KEY=your_key_here");
    process.exit(1);
  }

  if (!MCP_SERVER_URL) {
    console.error("❌ Error: MCP_SERVER_URL environment variable is not set");
    console.log("   Please set it: export MCP_SERVER_URL=your_mcp_server_url");
    console.log("   Or create a .env file with MCP_SERVER_URL=your_mcp_server_url");
    process.exit(1);
  }

  let mcpClient;

  try {
    // Connect to MCP server
    mcpClient = new MCPClient(MCP_SERVER_URL);
    await mcpClient.connect();

    // Create OpenAI agent with MCP tools
    const agent = new OpenAIAgent(mcpClient, {
      model: "gpt-4o-mini", // or "gpt-4o" for better results
      systemPrompt: `You are a helpful assistant with access to tools from an MCP server.
When users ask questions, use the available tools to find information and provide accurate answers.
Always use tools when relevant information might be available through them.
Provide clear, helpful responses based on the tool results.
If you cannot find relevant information, let the user know.`,
    });

    console.log("\n" + "=".repeat(60));
    console.log("🤖 Agent ready! You can now interact with the MCP tools.");
    console.log("=".repeat(60) + "\n");

    // Example: Single query
    const query = process.argv[2] || "What tools are available?";
    console.log(`📝 Query: ${query}\n`);

    const response = await agent.chat(query);
    console.log("\n" + "=".repeat(60));
    console.log("💬 Response:");
    console.log("=".repeat(60));
    console.log(response);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.cause) {
      console.error("   Cause:", error.cause);
    }
  } finally {
    // Close connection
    if (mcpClient) {
      await mcpClient.close();
    }
  }
}

main();

