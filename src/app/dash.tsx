import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function DashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Ionicons name="checkmark-circle-outline" size={64} color="#22c55e" />
      <Text className="mt-4 text-2xl font-bold text-gray-800">Welcome!</Text>
      <Text className="mb-6 mt-2 text-center text-gray-500">
        You're now authenticated and ready to go.
      </Text>

      <Pressable className="rounded-xl bg-gray-800 px-6 py-3" onPress={() => router.replace("/")}>
        <Text className="text-lg text-white">Logout</Text>
      </Pressable>
    </View>
  );
}
