import { addChatMessage, getChatMessages } from "@/lib/storage";
import { ChatMessage } from "@/lib/types";
import { useEffect, useState } from "react";
import { useMMKVString } from "react-native-mmkv";

export function useChatMessages(): [ChatMessage[], (message: ChatMessage) => void] {
  const [lastMsgTimeStamp, setLastMsgTimeStamp] = useMMKVString("chat.lastMsgTimeStamp");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleAddMessage = (message: ChatMessage) => {
    const msgs = addChatMessage(message);
    setMessages(msgs);
  };

  useEffect(() => {
    const data = getChatMessages();
    setMessages(data);
  }, [lastMsgTimeStamp]);

  return [messages, handleAddMessage];
}
