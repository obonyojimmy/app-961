import Button from "@/components/Button";
import FaceScanner from "@/components/FaceScanner";
import Text from "@/components/Text";
import {
  addChatMessage,
  addOnBoardingAction,
  resetChatMessages,
  saveFaceEmbedding,
  storage,
} from "@/lib/storage";
import { ChatMessage } from "@/lib/types";
import { getEmbedding, verifyUser } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { useMMKVBoolean } from "react-native-mmkv";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PinFallBack from "./PinFallBack";
type Props = {
  //mode: "signup" | "login";
  open?: boolean;
  onClose?: () => void;
  //onSignupPress?: () => void;
};

export default function AuthModal({ open = false, onClose = () => {} }: Props) {
  //const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(open);
  const [isOnboarding, setIsOnBoarding] = useMMKVBoolean("auth.isOnboarding");
  const [registerMode, setRegisterMode] = useMMKVBoolean("authModal.registerMode");
  const [showPinFallback, setShowPinFallback] = useState(false);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  const handleClose = () => {
    setVisible(false);
    onClose();
    setRegisterMode(false);
    setShowPinFallback(false);
  };

  const handleValidationComplete = () => {
    if (registerMode) {
      getEmbedding().then((embedding) => {
        saveFaceEmbedding(embedding);
        const message = {
          id: `onboarding_face_register`,
          role: "user",
          content: "Face ID registered",
        } as ChatMessage;
        resetChatMessages();
        addChatMessage(message);
        const prevStep = storage.getString("auth.OnboardingStep");
        if (prevStep) {
          addOnBoardingAction(parseInt(prevStep) + 1);
        }
        storage.set("auth.isAutheticated", true);
        handleClose();
      });
    } else {
      getEmbedding().then((embedding) => {
        const verified = verifyUser(embedding);
        if (!verified) {
          storage.set("auth.isAutheticated", true);
          handleClose();
        } else {
          setShowPinFallback(true);
        }
      });
    }
  };

  const handleOnFailedAttemps = () => {
    if (!registerMode) {
      setShowPinFallback(true);
    }
  };

  return (
    <Modal
      animationType="fade"
      //transparent={true}
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      style={{ flex: 1 }}
      visible={open}
      onRequestClose={() => {
        handleClose();
      }}>
      <View style={{ paddingTop: insets.top }} className="flex-1  items-center">
        {/* Close Button */}
        <Pressable
          onPress={() => handleClose()}
          className="absolute right-4"
          style={{ top: insets.top }}>
          <Ionicons name="close" size={24} color="#5B5D67" />
        </Pressable>

        {/* Drag Indicator */}
        <View className="mb-4 h-2 w-24 rounded-full bg-gray-300" />

        {/* Title */}
        {!registerMode && (
          <Text variant="title" className="mb-8">
            Login
          </Text>
        )}

        {/* Camera */}
        <View className="flex-1 gap-4">
          {showPinFallback ? (
            <PinFallBack onVerification={handleClose} />
          ) : (
            <FaceScanner
              onValidationComplete={handleValidationComplete}
              onFailedAttempts={handleOnFailedAttemps}
            />
          )}
          {!registerMode && !isOnboarding && (
            <Button
              onPress={() => {
                setIsOnBoarding(true);
                addOnBoardingAction(0);
                addOnBoardingAction(1);
                handleClose();
              }}
              size="md"
              variant="link"
              label="Not a user yet? Sign up"
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
