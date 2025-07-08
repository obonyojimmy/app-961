import LogoIcon from "@assets/icons/logo.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: "#ffd33d",
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <LogoIcon fill={color} width={28} height={28} />,
          //tabBarIcon: ({ color }) => <Ionicons name="compass" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ color }) => <Ionicons name="albums-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: "Deals",
          tabBarIcon: ({ color }) => <Ionicons name="pulse" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plus"
        options={{
          title: "Plus",
          tabBarIcon: ({ color }) => <Ionicons name="at" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
