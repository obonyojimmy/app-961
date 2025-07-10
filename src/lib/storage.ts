import { MMKV } from "react-native-mmkv";
import { ONBOARDING_aCTIONS } from "./assets";
import { ChatMessage } from "./types";

export const storage = new MMKV();

export function saveFaceEmbedding(embedding: number[]) {
  const json = JSON.stringify(embedding);
  storage.set("user.embeding", json);
}

export function SavePin(pin: string) {
  storage.set("user.pin", pin);
}
export function getPin() {
  return storage.getString("user.pin");
}

export function getSavedEmbedding(): number[] | null {
  const json = storage.getString("user.embeding");
  if (!json) return null;
  try {
    return JSON.parse(json) as number[];
  } catch {
    return null;
  }
}

// Save trusted zones
export const saveTrustedZones = (zones: string[]) => {
  const existing = getTrustedZones();
  // Avoid duplicates
  const updated = Array.from(new Set([...existing, ...zones]));
  storage.set("user.geozones", JSON.stringify(updated));
};

// Get trusted zones
export const getTrustedZones = (): string[] => {
  const stored = storage.getString("user.geozones");
  return stored ? JSON.parse(stored) : [];
};

export const addChatMessage = (message: ChatMessage) => {
  const now = Date.now();
  const messages = getChatMessages();
  messages.push(message);
  storage.set("chat.messages", JSON.stringify(messages));
  storage.set("chat.lastMsgTimeStamp", now.toString());
  return messages;
};

export const getChatMessages = () => {
  const json = storage.getString("chat.messages");
  if (!json) return [];
  try {
    return JSON.parse(json) as ChatMessage[];
  } catch {
    return [];
  }
};

export const resetChatMessages = () => {
  storage.delete("chat.messages");
  storage.delete("chat.lastMsgTimeStamp");
};

export const addOnBoardingAction = (index: number) => {
  if (index > ONBOARDING_aCTIONS.length - 1) return;
  const action = ONBOARDING_aCTIONS[index];
  const message = {
    id: `onboarding_${action.id.toString()}`,
    role: "assistant",
    content: action.prompt,
    ...(action.module && { module: action.module }),
  } as ChatMessage;
  addChatMessage(message);
  storage.set("auth.OnboardingStep", index.toString());
};

export const _resetOnboarding = () => {
  storage.delete("auth.isOnboarding");
  storage.delete("auth.OnboardingStep");
  resetChatMessages();
};

export function clearStorage() {
  storage.delete("user.embeding");
  //storage.delete("user.pin");
}
