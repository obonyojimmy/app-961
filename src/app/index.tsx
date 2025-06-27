import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function IndexScreen() {
  const goToFaceScan = (mode: "signup" | "login") => {
    router.push({
      pathname: "/(auth)/face-scan",
      params: { mode },
    });
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
      <Text className="mb-8 text-center text-2xl font-bold text-black dark:text-white">
        Welcome to FaceAuth
      </Text>

      <Pressable
        onPress={() => goToFaceScan("signup")}
        className="mb-4 w-full rounded-full bg-blue-600 px-6 py-3">
        <Text className="text-center text-lg text-white">Register with Face</Text>
      </Pressable>

      <Pressable
        onPress={() => goToFaceScan("login")}
        className="w-full rounded-full border border-blue-600 px-6 py-3">
        <Text className="text-center text-lg text-blue-600">Login with Face</Text>
      </Pressable>
    </View>
  );
}
