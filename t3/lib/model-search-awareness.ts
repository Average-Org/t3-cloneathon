export interface ModelSearchDefinition {
  modelName: string;
  canDoWebSearch: boolean;
  modelSearchName?: string;
  canReason: boolean;
}

export function getModelSearchDefinition(modelName: string) {
  const def: ModelSearchDefinition = {
    modelName: modelName,
    modelSearchName: modelName,
    canDoWebSearch: true,
    canReason: true,
  };

  switch (def.modelName) {
    case "gpt-4.1-nano": {
      def.canReason = false;
      def.canDoWebSearch = false;
      break;
    }
    case "gpt-4.1-mini": {
      def.canReason = false;
      break;
    }
    case "gpt-4.1": {
      def.canReason = false;
      break;
    }
    case "gpt-4o-mini": {
      def.canReason = false;
      break;
    }
    case "gpt-4o": {
      def.canReason = false;
      def.canDoWebSearch = true;
      break;
    }
    case "o3-mini": {
      def.canDoWebSearch = false;
      break;
    }
    case "o4-mini": {
      def.canDoWebSearch = false;
      break;
    }
    case "claude-3-7-sonnet-latest": {
      def.canDoWebSearch = false;
      break;
    }
    case "claude-3-5-sonnet-latest": {
      def.canDoWebSearch = false;
      break;
    }
    case "claude-sonnet-4-20250514": {
      def.canDoWebSearch = false;
      break;
    }
    case "claude-opus-4-20250514": {
      def.canDoWebSearch = false;
      break;
    }
    case "gemini-2.0-flash": {
      def.canReason = false;
      break;
    }
    case "gemini-2.0-flash-lite": {
      def.canReason = false;
      break;
    }
  }

  return def;
}
