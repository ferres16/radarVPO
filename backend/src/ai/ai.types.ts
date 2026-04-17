export type AiProvider = 'openai' | 'azure-openai' | 'anthropic';

export type AiCompletionInput = {
  systemPrompt: string;
  userInput: string;
  temperature?: number;
  maxTokens?: number;
};

export type AiCompletionResult = {
  provider: AiProvider;
  model: string;
  outputText: string;
  raw: unknown;
};
