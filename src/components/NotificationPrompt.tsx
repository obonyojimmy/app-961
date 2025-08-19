import { addChatMessage, resetChatMessages, storage } from "@/lib/storage";
import { ChatMessage } from "@/lib/types";
import { Pressable, View } from "react-native";
import Text from "./Text";

export default function NotificationPrompt() {
  const userName = storage.getString("user.name") || "";
  const handlePress = () => {
    const message = {
      id: "onboarding_notification_prompt",
      role: "assistant",
      content: [
        "Boom — notifications enabled!",
        " You’ll stay in the loop 🔔✨",
        "",
        `🎉 All set, ${userName!}`,
        "You’re officially onboarded to the 961 AI Super App.",
        "From now on, just ask me for what you need — 🚕 A taxi, 🍽️ food, 📰 the news, 🎟️ an event, or 🩸 help with blood donations.",
        "What can I help you with first?",
      ],
    } as ChatMessage;
    resetChatMessages();
    addChatMessage({
      id: "onboarding_notification_allowed",
      role: "user",
      content: "Notifications allowed",
    });
    addChatMessage(message);
  };
  return (
    <View className="mb-4  p-5 ">
      <Pressable onPress={handlePress} className="mb-4 w-full rounded-full bg-red-400 px-3 py-3">
        <Text className="text-center text-lg text-white">Allow notifications</Text>
      </Pressable>
    </View>
  );
}
