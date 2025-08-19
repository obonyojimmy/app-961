import AuthModal from "@/components/AuthModal";
import Button from "@/components/Button";
import Image from "@/components/Image";
import { MessageCard } from "@/components/MessageCard";
import Text from "@/components/Text";
import { useChatMessages } from "@/hooks/useChatMessages";
import { bannerText, ONBOARDING_aCTIONS } from "@/lib/assets";
import { addOnBoardingAction, resetChatMessages, storage } from "@/lib/storage";
import { ChatMessage } from "@/lib/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useState } from "react";
import { Keyboard, ScrollView, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useMMKVBoolean } from "react-native-mmkv";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const theme = useTheme();
  const [messages, addMessage] = useChatMessages();
  const [isOnboarding, setIsOnBoarding] = useMMKVBoolean("auth.isOnboarding");
  const [isAutheticated, setIsAutheticated] = useMMKVBoolean("auth.isAutheticated");
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [inputText, setInpuText] = useState<string>("");

  const openAuthModal = () => {
    setAuthModalOpen(true);
  };

  const onCloseAuthModal = () => {
    setAuthModalOpen(false);
  };

  const handleSendMessage = () => {
    const now = Date.now();
    const msg = {
      id: `user_${now}`,
      role: "user",
      content: inputText,
    } as ChatMessage;
    addMessage(msg);
    setInpuText("");
    Keyboard.dismiss();
    if (isOnboarding) {
      const prevStep = storage.getString("auth.OnboardingStep");
      const stepAction = ONBOARDING_aCTIONS.find((a) => a.id.toString() === prevStep);

      if (stepAction?.state) {
        storage.set(`user.${stepAction.state}`, inputText);
      }

      if (prevStep) {
        const nextAction = ONBOARDING_aCTIONS.find((a) => a.id === parseInt(prevStep) + 1);
        if (nextAction?.module === "registerPrompt") {
          resetChatMessages();
        }
        addOnBoardingAction(parseInt(prevStep) + 1);
      }
    }
  };

  return (
    <View
      className="flex-1 pb-2"
      // style={{ paddingBottom: insets.bottom }}
    >
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
                {!isAutheticated && (
                  <Button
                    onPress={() => {
                      //_resetOnboarding(); // for testing only
                      setAuthModalOpen(true);
                    }}
                    size="md"
                    variant="link"
                    label="Login"
                  />
                )}
              </View>
            );
          },
        }}
      />
      <KeyboardAvoidingView
        //keyboardVerticalOffset={insets.bottom}
        keyboardVerticalOffset={headerHeight + 5}
        style={{ flex: 1 }}
        behavior="translate-with-padding"
        // behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
          <View
            //contentContainerClassName="gap-2"
            //
            className="flex-1 px-2 pt-2">
            {!isOnboarding && !isAutheticated && (
              <View className="gap-2.5">
                <Text variant="subtitle">{bannerText}</Text>
              </View>
            )}
            <ScrollView contentContainerClassName="gap-2.5" className="flex-1 pt-1">
              {Array.isArray(messages) &&
                messages.map((item) => (
                  <MessageCard
                    key={item.id}
                    data={item}
                    openAuthModal={openAuthModal}
                    onCloseAuthModal={onCloseAuthModal}
                  />
                ))}
            </ScrollView>

            <View
              //style={{ marginBottom: insets.bottom }}
              className="flex-row items-center gap-2 self-end rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm shadow-slate-50">
              {/*  <Button
                //size="sm"
                //label="Post"
                variant="link"
                gap="lg"
                iconRight={
                  <MaterialCommunityIcons name="microphone" size={24} color={theme.colors.text} />
                }
              /> */}
              <TextInput
                placeholder="Ask Anything ..."
                value={inputText}
                onChangeText={setInpuText}
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
                  <MaterialCommunityIcons name="plus" size={24} color={theme.colors.text} />
                }
              />
              <Button
                //size="sm"
                //label="Post"
                onPress={handleSendMessage}
                variant="link"
                gap="lg"
                iconRight={
                  <MaterialCommunityIcons name="send" size={24} color={theme.colors.text} />
                }
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      {authModalOpen && <AuthModal open={authModalOpen} onClose={onCloseAuthModal} />}
    </View>
  );
}
