import { Colors } from "@/lib/colors";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
//import * as NavigationBar from "expo-navigation-bar";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
//import { useCallback, useEffect } from "react";
//import { Platform } from "react-native";

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativeWindColorScheme();

  /* const setNavigationBar = useCallback(async (colorScheme: "light" | "dark" = "light") => {
    if (Platform.OS !== "android") return;
    await Promise.all([
      NavigationBar.setButtonStyleAsync(colorScheme === "dark" ? "light" : "dark"),
      NavigationBar.setPositionAsync("absolute"),
      NavigationBar.setBackgroundColorAsync(colorScheme === "dark" ? "#00000030" : "#ffffff80"),
    ]);
  }, []); */

  /* useEffect(() => {
    if (Platform.OS !== "android") return;
    if (setNavigationBar && colorScheme) {
      setNavigationBar(colorScheme).catch((error) => {
        console.error('useColorScheme.tsx", "useInitialColorScheme', error);
      });
    }
  }, [setNavigationBar, colorScheme]); */

  return {
    colorScheme: colorScheme ?? "dark",
    isDarkColorScheme: colorScheme === "dark",
    setColorScheme,
    toggleColorScheme,
  };
}

export const LIGHT_THEME = {
  ...DefaultTheme,
  colors: Colors.light,
};
export const DARK_THEME = {
  ...DarkTheme,
  colors: Colors.dark,
};
