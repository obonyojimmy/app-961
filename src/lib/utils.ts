import { clsx, type ClassValue } from "clsx";
import * as Device from "expo-device";
import * as Location from "expo-location";
import Geohash from "ngeohash";
import { NativeModules } from "react-native";
import { twMerge } from "tailwind-merge";
import { getSavedEmbedding, getTrustedZones } from "./storage";

const { VideoEffectModule } = NativeModules;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDeviceFingerprint = async () => {
  return Device.osInternalBuildId;
};

export const getCurrentGeoHash = async (): Promise<string | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Permission to access location was denied");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = location.coords;
    const geohash6 = Geohash.encode(latitude, longitude, 6); // precision 6
    return geohash6;
  } catch (err) {
    console.error("Failed to get location or compute geohash:", err);
    return null;
  }
};

export const isInTrustedGeoZone = async (): Promise<boolean> => {
  try {
    const currentGeo = await getCurrentGeoHash();
    if (!currentGeo) return false;
    const trusted = getTrustedZones();
    return trusted.includes(currentGeo);
  } catch (err) {
    console.error("Geo check failed:", err);
    return false;
  }
};

export const getEmbedding = (): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    VideoEffectModule.extractFaceEmbedding(
      (embeddingArray: number[]) => {
        console.log("Embedding Found");
        resolve(embeddingArray);
      },
      (err: any) => {
        console.error("Embedding error:", err);
        reject(err);
      },
    );
  });
};

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function verifyUser(embedding1: number[]): boolean {
  const savedEmbedding = getSavedEmbedding();
  if (savedEmbedding) {
    const similarity = cosineSimilarity(embedding1, savedEmbedding);
    console.log("Similarity:", similarity);
    return similarity > 0.93;
  } else {
    return false;
  }
}
