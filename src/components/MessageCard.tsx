import Text from "@/components/Text";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from "react";
import { View } from "react-native";
import CreatePasscodeCard from "./CreatePasscodeCard";
import NotificationPrompt from "./NotificationPrompt";
import RegisterCard from "./RegisterCard";

type MessageCardProps = {
  data: ChatMessage;
  openAuthModal: () => void;
  onCloseAuthModal: () => void;
};

export function MessageCard({
  data,
  openAuthModal = () => {},
  onCloseAuthModal = () => {},
}: MessageCardProps) {
  const { id, role, content, module } = data;
  const isUser = role === "user";

  const renderModule = () => {
    switch (module) {
      case "registerPrompt":
        return <RegisterCard openAuthModal={openAuthModal} />;
      case "createPassCode":
        return <CreatePasscodeCard />;
      case "notificationPrompt":
        return <NotificationPrompt />;
      default:
        break;
    }
  };

  return (
    <View>
      <View className={cn("mb-1", isUser && "items-end")}>
        <View
          className={cn(
            "px-1 py-1",
            isUser &&
              "max-w-[97%] rounded-2xl rounded-br-none border border-slate-200 bg-green-100 px-3 py-2.5",
          )}>
          {Array.isArray(content) ? (
            content.map((line, idx) => {
              if (typeof line === "string") {
                return (
                  <Text variant="subtitle" key={idx} className="text-gray-800">
                    {line}
                  </Text>
                );
              }
              //console.log(line);
              return (
                <Text
                  variant="subtitle"
                  fontWeight={line?.fontWeight}
                  key={idx}
                  className="text-gray-800">
                  {line?.text}
                </Text>
              );
            })
          ) : (
            <Text variant="subtitle" className="text-gray-800">
              {content}
            </Text>
          )}
        </View>
      </View>
      {module && renderModule()}
    </View>
  );
}
