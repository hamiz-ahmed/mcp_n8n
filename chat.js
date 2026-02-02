import "dotenv/config";
import * as readline from "readline";
import { MCPClient } from "./mcp-client.js";
import { OpenAIAgent } from "./openai-agent.js";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL;

async function main() {
  console.log("🚀 Starting Interactive MCP Chat\n");

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
      model: "gpt-4o-mini",
      systemPrompt: `You are a helpful assistant with access to tools from an MCP server.
When users ask questions, use the available tools to find information and provide accurate answers.
Always use tools when relevant information might be available through them.
Provide clear, helpful responses based on the tool results.
If you cannot find relevant information, let the user know.
Always respond in the same language the user uses.`,
    });

    console.log("\n" + "=".repeat(60));
    console.log("🤖 Interactive Chat Ready!");
    console.log("   Type your questions to query the MCP server");
    console.log("   Commands: 'quit' or 'exit' to end, 'clear' to reset");
    console.log("=".repeat(60) + "\n");

    // Create readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const promptUser = () => {
      rl.question("You: ", async (input) => {
        const trimmedInput = input.trim();

        if (!trimmedInput) {
          promptUser();
          return;
        }

        // Handle special commands
        if (trimmedInput.toLowerCase() === "quit" || trimmedInput.toLowerCase() === "exit") {
          console.log("\n👋 Goodbye!");
          rl.close();
          await mcpClient.close();
          process.exit(0);
        }

        if (trimmedInput.toLowerCase() === "clear") {
          agent.resetConversation();
          promptUser();
          return;
        }

        try {
          console.log("\n⏳ Thinking...\n");
          const response = await agent.chat(trimmedInput);
          console.log("\n" + "-".repeat(60));
          console.log("🤖 Assistant:", response);
          console.log("-".repeat(60) + "\n");
        } catch (error) {
          console.error("\n❌ Error:", error.message);
        }

        promptUser();
      });
    };

    promptUser();
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.cause) {
      console.error("   Cause:", error.cause);
    }
    if (mcpClient) {
      await mcpClient.close();
    }
    process.exit(1);
  }
}

main();

