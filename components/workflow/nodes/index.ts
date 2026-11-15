import { UserInputNode } from "./user-input-node";
import { PromptTemplateNode } from "./prompt-template-node";
import { LlmRunNode } from "./llm-run-node";
import { EvaluateNode } from "./evaluate-node";
import { FinalOutputNode } from "./final-output-node";

export const workflowNodeTypes = {
  userInput: UserInputNode,
  promptTemplate: PromptTemplateNode,
  llmRun: LlmRunNode,
  evaluate: EvaluateNode,
  finalOutput: FinalOutputNode,
};

export {
  UserInputNode,
  PromptTemplateNode,
  LlmRunNode,
  EvaluateNode,
  FinalOutputNode,
};
