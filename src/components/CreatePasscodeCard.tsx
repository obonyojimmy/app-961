import { addOnBoardingAction, resetChatMessages, SavePin, storage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, TextInput, View } from "react-native";
import Text from "./Text";
export default function CreatePasscodeCard() {
  const theme = useTheme();
  const length = 6;
  const [pin, setPin] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(TextInput | null)[]>([]);
  useEffect(() => {
    if (pin.length === 6) {
      return;
    }
    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      // Re-focus the first input after keyboard dismiss
      setTimeout(() => {
        inputs.current[0]?.focus();
      }, 5); // small delay allows things to settle
    });

    return () => {
      keyboardHideListener.remove();
    };
  }, [pin]);

  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newPin = [...pin];
      newPin[index] = text;
      setPin(newPin);

      // Focus next input
      if (index < length - 1) {
        inputs.current[index + 1]?.focus();
      }
      if (index === length - 1 || newPin.every((val) => val !== "")) {
        Keyboard.dismiss();
      }
    } else if (text === "") {
      const newPin = [...pin];
      newPin[index] = "";
      setPin(newPin);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && pin[index] === "") {
      console.log("Backspace pressed");
      if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleSetPasscode = () => {
    const pinCode = pin.join("");
    console.log("Saving passcode:", pinCode);
    SavePin(pinCode);
    const prevStep = storage.getString("auth.OnboardingStep");
    resetChatMessages();
    if (prevStep) {
      addOnBoardingAction(parseInt(prevStep) + 1);
    }
  };

  return (
    <View className="mb-4 items-center justify-center rounded-2xl bg-gray-100 p-5 shadow-md">
      {/* Icon */}
      <View className="mb-4 rounded-full bg-gray-200 p-3">
        <MaterialCommunityIcons name="lock" size={24} color={theme.colors.text} />
      </View>

      {/* Title & Subtitle */}
      <Text className="mb-1 text-lg font-semibold text-gray-700">Create passcode</Text>
      <Text className="text-sm text-gray-500">Set a 6-digit passcode as a backup</Text>

      {/* PIN Inputs */}
      <View className="mt-5 flex-row gap-3">
        {pin.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            className={cn(
              "h-12 w-12 rounded-full border-2 border-gray-300 bg-white  text-center align-middle text-base text-black",
              digit ? "border-red-400" : "border-gray-300",
            )}
            autoFocus={index === 0}
            maxLength={1}
            keyboardType="number-pad"
            secureTextEntry={true}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>
      <Pressable
        onPress={handleSetPasscode}
        className="my-4 w-full rounded-full bg-red-400 px-3 py-3">
        <Text className="text-center text-lg text-white">Set Passcode</Text>
      </Pressable>
    </View>
  );
}
