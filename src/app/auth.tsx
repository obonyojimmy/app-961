import { useLocalSearchParams, useNavigation } from "expo-router";
import { View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Text from "@/components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import FaceScanner from "@/components/FaceScanner";


export default function LoginModal() {
  

  const navigation = useNavigation();
  const insets = useSafeAreaInsets()

  

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1  items-center">
      <StatusBar hidden />
      {/* Close Button */}
      <Pressable
        onPress={() => navigation.goBack()}
        className="absolute right-4"
        style={{ top: insets.top }}
      >
        <Ionicons name="close" size={24} color="#5B5D67" />
      </Pressable>

      {/* Drag Indicator */}
      <View className="w-24 h-2 rounded-full bg-gray-300 mb-4" />

      {/* Title */}
      <Text variant="title" className="mb-8">Login</Text>

      {/* Camera */}
      <FaceScanner  />
    </View>
  );
}
