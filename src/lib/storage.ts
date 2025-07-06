import { MMKV } from "react-native-mmkv";

export const storage = new MMKV();


export function saveFaceEmbedding(embedding: number[]) {
  const json = JSON.stringify(embedding);
  storage.set("user.embeding", json);
}

export function SavePin(pin: string) {
  storage.set("user.pin", pin);
}
export function getPin(pin: string) {
  storage.getString("user.pin");
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

export function clearStorage() {
  storage.delete("user.embeding");
  //storage.delete("user.pin");
}
