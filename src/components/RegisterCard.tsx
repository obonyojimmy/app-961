import Text from "@/components/Text";
import { storage } from "@/lib/storage";
import { Pressable, View } from "react-native";

type Props = {
  openAuthModal: () => void;
};
export default function RegisterCard({ openAuthModal = () => {} }) {
  const handlePress = () => {
    storage.set("authModal.registerMode", true);
    openAuthModal();
  };
  return (
    <View className="mb-4 items-center justify-center rounded-2xl bg-gray-100 p-5 shadow-md">
      <Text className="mb-4 text-center text-2xl font-bold">Register with Face</Text>
      <Text className="mb-4 text-center text-lg font-medium">
        Take a selfie and register your account
      </Text>
      <Pressable onPress={handlePress} className="mb-4 w-full rounded-full bg-red-400 px-3 py-3">
        <Text className="text-center text-lg text-white">Take a Selfie</Text>
      </Pressable>
    </View>
  );
}
