import Button from "@/components/Button";
import Image from "@/components/Image";
import { ChatMessage } from "@/lib/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  return (
    <KeyboardAvoidingView
      enabled
      //keyboardVerticalOffset={insets.bottom}
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={160}>
      <TouchableWithoutFeedback style={{ flex: 1 }} className="flex-1" onPress={Keyboard.dismiss}>
        <View
          //contentContainerClassName="gap-2"
          style={{ marginBottom: insets.bottom }}
          className="flex-1 px-2 pt-2">
          <Stack.Screen
            options={{
              title: "",
              //headerTransparent: true,
              headerShown: true,
              headerShadowVisible: false,
              headerTitleAlign: "center",
              headerTitle: () => {
                return (
                  <View className="flex-row items-center justify-center gap-1.5">
                    <Image
                      //contentFit="cover"
                      cachePolicy="memory-disk"
                      source={require("@assets/icon.png")}
                      className={"h-12 w-12 rounded-full"}
                    />
                  </View>
                );
              },

              headerRight: () => {
                return (
                  <View className="flex-row items-center pr-2">
                    <Button size="md" variant="link" label="Login" />
                  </View>
                );
              },
            }}
          />
          <ScrollView contentContainerClassName="gap-2" className="flex-1 pt-1"></ScrollView>

          <View
            //style={{ marginBottom: insets.bottom }}
            className="flex-row items-center gap-2 self-end rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm shadow-slate-50">
            <Button
              //size="sm"
              //label="Post"
              variant="link"
              gap="lg"
              iconRight={<MaterialCommunityIcons name="plus" size={24} color={theme.colors.text} />}
            />
            <TextInput
              placeholder="Type a message ..."
              //value={comment}
              //onChangeText={setComment}
              //multiline
              //numberOfLines={1}
              className="flex-1 text-base font-normal text-slate-600"
            />
            <Button
              //size="sm"
              //label="Post"
              variant="link"
              gap="lg"
              iconRight={
                <MaterialCommunityIcons name="microphone" size={24} color={theme.colors.text} />
              }
            />
            <Button
              //size="sm"
              //label="Post"
              variant="link"
              gap="lg"
              iconRight={<MaterialCommunityIcons name="send" size={24} color={theme.colors.text} />}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
