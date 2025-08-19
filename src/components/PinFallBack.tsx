import { getPin, storage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Text, TextInput, View } from "react-native";

export default function PinFallBack({ onVerification = () => {} }: { onVerification: () => void }) {
  const theme = useTheme();
  const length = 6;
  const [pin, setPin] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(TextInput | null)[]>([]);

  /* useEffect(() => {
    inputs.current[0]?.focus();
  }, []); */
  useEffect(() => {
    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      // Re-focus the first input after keyboard dismiss
      setTimeout(() => {
        inputs.current[0]?.focus();
      }, 5); // small delay allows things to settle
    });

    return () => {
      keyboardHideListener.remove();
    };
  }, []);

  const login = useCallback(() => {
    const pinCode = pin.join("");
    const savedPin = getPin();
    console.log("Submitting PIN:", pinCode);

    if (savedPin === pinCode) {
      onVerification();
    }
  }, [pin]);

  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newPin = [...pin];
      newPin[index] = text;
      console.log("New PIN:", newPin);
      setPin(newPin);

      // Focus next input
      if (index < length - 1) {
        inputs.current[index + 1]?.focus();
      }
      // Check if all digits are filled
      if (index === length - 1 || newPin.every((val) => val !== "")) {
        // Delay slightly to allow last digit to render
        //setTimeout(() => {
        //login();
        const pinCode = newPin.join("");
        const savedPin = getPin();
        console.log("Submitting PIN:", pinCode);

        if (savedPin === pinCode) {
          onVerification();
          storage.set("auth.isAutheticated", true);
        }
        //}, 100); // 100ms delay ensures latest digit is set
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
  console.log(" PIN:", pin.join(""));

  return (
    <View className="mb-4 items-center justify-center rounded-2xl bg-gray-100 p-5 shadow-md">
      {/* Icon */}
      <View className="mb-4 rounded-full bg-gray-200 p-3">
        <MaterialCommunityIcons name="lock" size={24} color={theme.colors.text} />
      </View>

      {/* Title & Subtitle */}
      <Text className="mb-1 text-lg font-semibold text-gray-700">Enter passcode</Text>

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
    </View>
  );
}
