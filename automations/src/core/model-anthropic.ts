/**
 * Live model client.
 *
 * The SDK is an optional dependency and imported lazily, so simulated runs
 * work with no node_modules at all.
 */
import type { ModelClient, ModelMessage, ModelTurn, ToolDef } from './types.ts';

export interface AnthropicOptions {
  apiKey: string;
  model?: string;
  /** Adds Anthropic's server-side web search. Runs on their infra, no key. */
  webSearch?: boolean;
}

export async function anthropicModel(opts: AnthropicOptions): Promise<ModelClient> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk').catch(() => {
    throw new Error(
      'Live runs need the Anthropic SDK: npm install --prefix automations @anthropic-ai/sdk',
    );
  }) as any;

  const client = new Anthropic({ apiKey: opts.apiKey });
  const model = opts.model ?? 'claude-opus-5';

  return {
    id: model,
    async complete({ system, messages, tools, maxTokens }): Promise<ModelTurn> {
      const declared: any[] = tools.map(toApiTool);
      if (opts.webSearch) {
        declared.push({ type: 'web_search_20260209', name: 'web_search', max_uses: 8 });
      }

      const response = await client.messages.create({
        model,
        max_tokens: maxTokens ?? 8000,
        // Adaptive thinking is the current API; budget_tokens is rejected on
        // this model family.
        thinking: { type: 'adaptive' },
        output_config: { effort: 'high' },
        system,
        tools: declared.length ? declared : undefined,
        messages: messages.map(toApiMessage),
      });

      const text = response.content
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('\n')
        .trim();

      const toolCalls = response.content
        .filter((b: any) => b.type === 'tool_use')
        .map((b: any) => ({ id: b.id, name: b.name, input: b.input ?? {} }));

      return {
        text,
        toolCalls,
        usage: {
          inputTokens: response.usage?.input_tokens ?? 0,
          outputTokens: response.usage?.output_tokens ?? 0,
        },
        stop: response.stop_reason ?? 'end_turn',
        refusal: response.stop_details?.explanation,
      };
    },
  };
}

function toApiTool(tool: ToolDef) {
  return {
    name: tool.name,
    description: tool.description,
    input_schema: tool.input_schema,
    // Guarantees arguments validate against the schema.
    strict: true,
  };
}

function toApiMessage(m: ModelMessage) {
  return {
    role: m.role,
    content: m.content.map((block) => {
      switch (block.type) {
        case 'text':
          return { type: 'text', text: block.text };
        case 'tool_use':
          return { type: 'tool_use', id: block.id, name: block.name, input: block.input };
        case 'tool_result':
          return {
            type: 'tool_result',
            tool_use_id: block.toolUseId,
            content: block.content,
            is_error: block.isError ?? false,
          };
      }
    }),
  };
}
