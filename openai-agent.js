import OpenAI from "openai";

/**
 * OpenAI Agent that uses MCP tools for function calling
 */
export class OpenAIAgent {
  constructor(mcpClient, options = {}) {
    this.mcpClient = mcpClient;
    this.openai = new OpenAI({
      apiKey: options.apiKey || process.env.OPENAI_API_KEY,
    });
    this.model = options.model || "gpt-4o-mini";
    this.systemPrompt =
      options.systemPrompt ||
      `You are a helpful assistant with access to tools. 
When the user asks questions, use the available tools to find information and provide accurate answers.
Always use tools when relevant information might be available through them.
Provide clear, helpful responses based on the tool results.`;
    this.conversationHistory = [];
  }

  /**
   * Process a user message and get a response
   */
  async chat(userMessage) {
    // Add user message to history
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    // Get tools in OpenAI format
    const tools = this.mcpClient.getToolsForOpenAI();

    // Create messages array with system prompt
    const messages = [
      { role: "system", content: this.systemPrompt },
      ...this.conversationHistory,
    ];

    try {
      // Call OpenAI
      let response = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined,
      });

      let assistantMessage = response.choices[0].message;

      // Handle tool calls if present
      while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log(`\n🤖 Assistant wants to call ${assistantMessage.tool_calls.length} tool(s)`);

        // Add assistant message with tool calls to history
        this.conversationHistory.push(assistantMessage);

        // Process each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

          console.log(`\n📞 Calling tool: ${toolName}`);

          // Call the MCP tool
          const toolResult = await this.mcpClient.callTool(toolName, toolArgs);

          // Extract text content from result
          let resultContent = "";
          if (toolResult.content && Array.isArray(toolResult.content)) {
            resultContent = toolResult.content
              .map((item) => (item.type === "text" ? item.text : JSON.stringify(item)))
              .join("\n");
          } else {
            resultContent = JSON.stringify(toolResult);
          }

          console.log(`📄 Tool result preview: ${resultContent.substring(0, 200)}...`);

          // Add tool result to history
          this.conversationHistory.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: resultContent,
          });
        }

        // Get next response from OpenAI with tool results
        const updatedMessages = [
          { role: "system", content: this.systemPrompt },
          ...this.conversationHistory,
        ];

        response = await this.openai.chat.completions.create({
          model: this.model,
          messages: updatedMessages,
          tools: tools.length > 0 ? tools : undefined,
          tool_choice: tools.length > 0 ? "auto" : undefined,
        });

        assistantMessage = response.choices[0].message;
      }

      // Add final assistant response to history
      this.conversationHistory.push({
        role: "assistant",
        content: assistantMessage.content,
      });

      return assistantMessage.content;
    } catch (error) {
      console.error("OpenAI API error:", error.message);
      throw error;
    }
  }

  /**
   * Reset conversation history
   */
  resetConversation() {
    this.conversationHistory = [];
    console.log("🔄 Conversation history cleared");
  }
}

export default OpenAIAgent;

