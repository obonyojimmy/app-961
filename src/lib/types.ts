export interface RichMessageText {
  text: string;
  fontWeight?: "bold" | "normal" | "semibold" | "medium" | "extrabold";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string | string[] | RichMessageText[];
  module?: "registerPrompt" | "createPassCode" | "notificationPrompt";
}
