import { MMKV } from "react-native-mmkv";

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

export function clearStorage() {
  storage.delete("user.embeding");
  //storage.delete("user.pin");
}
